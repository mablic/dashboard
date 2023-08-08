from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm, UserDiscordUpdateForm, UserProfileUpdateForm
from django.conf import settings
from .models import Profile, User
from dashboard.models import CheckIn, UserAnswer
from django.contrib.auth.hashers import make_password
import requests
import random
from allauth.socialaccount.models import SocialApp
from allauth.socialaccount.providers.oauth2.views import (
    OAuth2Adapter,
    OAuth2LoginView,
)
from allauth.socialaccount.providers.oauth2.client import OAuth2Error

class URL_TOKEN:
    discordTokenUrl = 'https://discord.com/api/oauth2/token'
    discordAuthUrl = 'https://discord.com/api/oauth2/authorize'
    googleAuthUrl = 'https://accounts.google.com/o/oauth2/auth'
    googleCallBackAuthUrl = 'https://accounts.google.com/o/oauth2/token'
    googleProfileUrl = 'https://www.googleapis.com/oauth2/v1/userinfo'

def generate_redirect_uri(request, provider):
    currenHost = request.get_host()
    # print(currenHost)
    if settings.DEBUG:
        return f'http://{currenHost}/callback/{provider}/'
    return f'https://{currenHost}/callback/{provider}/'

def generate_random_password(length=10):
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
    password = ''.join(characters[random.randint(1,len(characters)-1)] for _ in range(10))
    return password

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})

def callback(request, provider):
    print("IN THE CALL BACK!")
    print(request)
    # source = request.GET.get('source')
    print(f"provider is:{provider}")
    if provider == 'discord':
        return discord_callback(request, provider)
    elif provider == 'google':
        return google_callback(request, provider)
    u_form = UserUpdateForm(instance=request.user)
    p_form = ProfileUpdateForm(instance=request.user.profile)
    context = {
        'u_form': u_form,
        'p_form': p_form
    }
    return render(request, 'users/profile.html', context)

def discord_callback(request, provider):
    params = {
        'client_id': settings.DISCORD_CLIENT_ID,
        'client_secret': settings.DISCORD_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': request.GET.get('code'),
        'redirect_uri': generate_redirect_uri(request, provider),
        'scope': 'identify',  # Add more scopes as needed
    }
    response = requests.post(URL_TOKEN.discordTokenUrl, data=params)

    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data['access_token']
        discordUserId, discordUserName = get_discord_user(access_token)
        oldUserId = ''
        oldUserEmail = ''
        if request.user.is_authenticated:
            oldProfile = Profile.objects.get(user=request.user)
            oldUser = User.objects.get(id=oldProfile.user_id)
            oldUserId = oldProfile.user_id
            oldUserEmail = oldUser.email
            print(f"old profile id: {oldProfile.id}; old user: {oldUser}")
        try:
            profile = Profile.objects.get(discordId=discordUserId)
            user = User.objects.get(id=profile.user_id)
            print(f"new userName id is: {user.id}; new user: {user}")
            if oldUserId:
                user.email = oldUserEmail
                UserAnswer.update_user_id(oldUserId, profile.user_id)
                CheckIn.update_user_id(oldUserId, profile.user_id)
                oldUser.delete()
                user.save()
                print(f"old user id is: {oldUserId}; new user id is: {user.id}")

        except Profile.DoesNotExist:
            hashedPassword = make_password(generate_random_password())
            user = User.objects.create_user(username=discordUserName, password=hashedPassword)
            user.profile.discordId = discordUserId
            user.profile.discordName = discordUserName
            user.profile.save()
        login(request, user, backend='allauth.account.auth_backends.AuthenticationBackend')
        return redirect('profile')
    else:
        return render(request, 'users/error.html')

def google_callback(request, provider):

    try:
        googleApp = SocialApp.objects.get(provider=provider)
        code = request.GET.get('code')

        params = {
            'code': code,
            'client_id': googleApp.client_id,
            'client_secret': googleApp.secret,
            'redirect_uri': generate_redirect_uri(request, provider),
            'grant_type': 'authorization_code',
        }
        response = requests.post(URL_TOKEN.googleCallBackAuthUrl, data=params)
        if response.status_code == 200:
            tokenData = response.json()
            accessToken = tokenData.get('access_token')

            # Get the user profile information using the access token
            headers = {'Authorization': f'Bearer {accessToken}'}
            profileResponse = requests.get(URL_TOKEN.googleProfileUrl, headers=headers)

            if profileResponse.status_code == 200:
                profileData = profileResponse.json()
                googleUserEmail = profileData.get('email')
                googleUserName = profileData.get('name') 
                try:
                    # print(f"email: {googleUserEmail}; userName: {googleUserName}")
                    user = User.objects.get(email=googleUserEmail)
                except User.DoesNotExist:
                    # If the user doesn't exist, create a new user and profile
                    hashedPassword = make_password(generate_random_password())
                    print(f"PW is: {hashedPassword}")
                    user = User.objects.create_user(username=googleUserName, email=googleUserEmail ,password=hashedPassword)
                # Log in the user and redirect to the profile page
                login(request, user, backend='allauth.account.auth_backends.AuthenticationBackend')
                return redirect('profile')
            else:
                print('Failed to get user profile from Google.')
        else:
            print('Failed to get access token from Google.')
    except SocialApp.DoesNotExist:
        print('Google SocialApp not found.')
    return redirect('profile')


def login_with_vendor(request, provider):
    print(f"Request is: {request}")
    print(f"Provider is {provider}")
    if provider == 'discord':
        params = {
            'client_id': settings.DISCORD_CLIENT_ID,
            'redirect_uri': generate_redirect_uri(request, provider),
            'response_type': 'code',
            'scope': 'identify',  # Add more scopes as needed
        }
        authUrl = f'{URL_TOKEN.discordAuthUrl}?{"&".join(f"{k}={v}" for k, v in params.items())}'
        # print(authUrl)
        # print(generate_redirect_uri(request, provider))
        return redirect(authUrl)
    elif provider == 'google':
        try:
            googleApp = SocialApp.objects.get(provider='google')
            scope = 'email profile'
            auth_params = {
                'client_id': googleApp.client_id,
                'secret': googleApp.secret,
                'redirect_uri': generate_redirect_uri(request, provider),
                'scope': scope,
                'response_type': 'code',
            }
            authUrl = f"{URL_TOKEN.googleAuthUrl}?{'&'.join(f'{k}={v}' for k, v in auth_params.items())}"
            # print(generate_redirect_uri(request, provider))
            return redirect(authUrl)
        except SocialApp.DoesNotExist:
            return render(request, 'users/error.html')
    return redirect('login')

@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST,
                                   request.FILES,
                                   instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, f'Your account has been updated!')
            return redirect('profile')
            
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }

    return render(request, 'users/profile.html', context)

@login_required
def authorize(request):
    params = {
        'client_id': settings.DISCORD_CLIENT_ID,
        'redirect_uri': generate_redirect_uri(request, 'discord'),
        # 'redirect_uri': settings.DISCORD_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'identify',  # Add more scopes as needed
    }
    authUrl = f'{URL_TOKEN.discordAuthUrl}?{"&".join(f"{k}={v}" for k, v in params.items())}'
    return redirect(authUrl)

def get_discord_user(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    response = requests.get('https://discord.com/api/users/@me', headers=headers)

    if response.status_code == 200:
        userData = response.json()
        discordId = userData['id']
        username = userData['username']
        print(userData)
        return discordId, username
    else:
        # Handle error case
        return None, None