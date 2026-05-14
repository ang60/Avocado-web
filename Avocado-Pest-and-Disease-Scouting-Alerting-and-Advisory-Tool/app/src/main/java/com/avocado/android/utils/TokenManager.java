package com.avocado.android.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {

    private static final String PREFS_NAME = Constants.SHARED_PREFERENCES;
    private static final String KEY_ACCESS_TOKEN = Constants.ACCESS_TOKEN;
    private static final String KEY_REFRESH_TOKEN = Constants.REFRESH_TOKEN;
    private static final String ID = Constants.ID;
    private static final String FIRST_NAME = Constants.FIRST_NAME;
    private static final String LAST_NAME = Constants.LAST_NAME;
    private static final String EMAIL = Constants.EMAIL;
    private static final String PHONE_NUMBER = Constants.PHONE_NUMBER;
    private static final String ROLE = Constants.ROLE;
    private static final String COUNTY = Constants.COUNTY;

    private final SharedPreferences sharedPreferences;

    public TokenManager(Context context) {
        this.sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public String getAccessToken() {
        return sharedPreferences.getString(KEY_ACCESS_TOKEN, "");
    }

    public void saveAccessToken(String accessToken) {
        sharedPreferences.edit()
                .putString(KEY_ACCESS_TOKEN, accessToken)
                .apply();
    }

    public String getRefreshToken() {
        return sharedPreferences.getString(KEY_REFRESH_TOKEN, "");
    }

    public void saveRefreshToken(String refreshToken) {
        sharedPreferences.edit()
                .putString(KEY_REFRESH_TOKEN, refreshToken)
                .apply();
    }

    public void clearTokens() {
        sharedPreferences.edit()
                .remove(KEY_ACCESS_TOKEN)
                .remove(KEY_REFRESH_TOKEN)
                .apply();
    }

    public void saveTimeToLive(long timeToLive) {
        sharedPreferences.edit()
                .putLong(Constants.TIME_TO_LIVE, timeToLive)
                .apply();
    }

    public boolean isTokenExpired() {
        long currentTime = System.currentTimeMillis();
        long timeToLive = sharedPreferences.getLong(Constants.TIME_TO_LIVE, 0);
        return currentTime > timeToLive;
    }

    public void saveUserData(String id, String firstName, String lastName, String email, String phoneNumber, String role, String county) {
        sharedPreferences.edit()
                .putString(ID, id)
                .putString(FIRST_NAME, firstName)
                .putString(LAST_NAME, lastName)
                .putString(EMAIL, email)
                .putString(PHONE_NUMBER, phoneNumber)
                .putString(ROLE, role)
                .putString(COUNTY, county)
                .apply();
    }

    public void clearUserData() {
        sharedPreferences.edit()
                .remove(ID)
                .remove(FIRST_NAME)
                .remove(LAST_NAME)
                .remove(EMAIL)
                .remove(PHONE_NUMBER)
                .remove(ROLE)
                .remove(COUNTY)
                .apply();
    }

    public String getUserId() {
        return sharedPreferences.getString(ID, "");
    }

    public String getFirstName() {
        return sharedPreferences.getString(FIRST_NAME, "");
    }

    public String getLastName() {
        return sharedPreferences.getString(LAST_NAME, "");
    }

    public String getEmail() {
        return sharedPreferences.getString(EMAIL, "");
    }

    public String getPhoneNumber() {
        return sharedPreferences.getString(PHONE_NUMBER, "");
    }

    public String getRole() {
        return sharedPreferences.getString(ROLE, "");
    }

    public String getCounty() {
        return sharedPreferences.getString(COUNTY, "");
    }

    public void setFirstName(String firstName) {
        sharedPreferences.edit()
                .putString(FIRST_NAME, firstName)
                .apply();
    }

    public void setLastName(String lastName) {
        sharedPreferences.edit()
                .putString(LAST_NAME, lastName)
                .apply();
    }

    public void setPhoneNumber(String phoneNumber) {
        sharedPreferences.edit()
                .putString(PHONE_NUMBER, phoneNumber)
                .apply();
    }

    public void setCounty(String county) {
        sharedPreferences.edit()
                .putString(COUNTY, county)
                .apply();
    }
}
