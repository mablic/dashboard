from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm, UserDiscordUpdateForm, UserProfileUpdateForm
from django.conf import settings
from .models import Profile
import requests

def generateRedirectUri(request):
    currenHost = request.get_host()
    # print(currenHost)
    return f'https://{currenHost}/callback'

def register(request):
    # print('test1')
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

@login_required
def profile(request):
    # print('test')
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
    discord_auth_url = 'https://discord.com/api/oauth2/authorize'
    params = {
        'client_id': settings.DISCORD_CLIENT_ID,
        'redirect_uri': generateRedirectUri(request),
        # 'redirect_uri': settings.DISCORD_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'identify',  # Add more scopes as needed
    }
    auth_url = f'{discord_auth_url}?{"&".join(f"{k}={v}" for k, v in params.items())}'
    return redirect(auth_url)


def callback(request):
    discord_token_url = 'https://discord.com/api/oauth2/token'
    params = {
        'client_id': settings.DISCORD_CLIENT_ID,
        'client_secret': settings.DISCORD_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': request.GET.get('code'),
        'redirect_uri': generateRedirectUri(request),
        # 'redirect_uri': settings.DISCORD_REDIRECT_URI,
        'scope': 'identify',  # Add more scopes as needed
    }

    response = requests.post(discord_token_url, data=params)

    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data['access_token']
        userId, userName = get_discord_user(access_token)
        print(request.user)
        # Retrieve the Profile instance from the database
        profile = Profile.objects.get(user=request.user)

        # Update the discordId and discordName fields
        profile.discordId = userId
        profile.discordName = userName
        profile.save()

        u_form = UserDiscordUpdateForm(request.POST, instance=request.user)
        p_form = UserProfileUpdateForm(request.POST, instance=Profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, f'Your account has been updated!')
            return redirect('profile')

    else:
        return render(request, 'users/error.html')

    u_form = UserUpdateForm(instance=request.user)
    p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }

    return render(request, 'users/profile.html', context)

def get_discord_user(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    response = requests.get('https://discord.com/api/users/@me', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        discord_id = user_data['id']
        username = user_data['username']
        # You can access more user information such as discriminator, avatar, etc.
        return discord_id, username
    else:
        # Handle error case
        return None, None