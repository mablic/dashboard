from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()
    # discordServer = forms.CharField()

    class Meta:
        model = User
        fields = ['email']


class ProfileUpdateForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = []


class UserDiscordUpdateForm(forms.ModelForm):
    discordId = forms.CharField()
    discordName = forms.CharField()

    class Meta:
        model = User
        fields = ['discordId', 'discordName']


class UserProfileUpdateForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = ['discordId', 'discordName']