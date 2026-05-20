package com.avocado.android;

import android.app.Application;
import android.content.SharedPreferences;

import com.androidnetworking.AndroidNetworking;
import com.avocado.android.utils.TokenManager;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class App extends Application {

    private static App instance;
    private static ExecutorService executorService;
    private static String userId;

    @Override
    public void onCreate() {
        super.onCreate();

        instance = this;
        executorService = Executors.newFixedThreadPool(4);

        TokenManager tokenManager = new TokenManager(getApplicationContext());
        userId = tokenManager.getUserId();

        AndroidNetworking.initialize(getApplicationContext());
    }

    public static App getInstance() {
        return instance;
    }

    public static ExecutorService getExecutorService() {
        return executorService;
    }

    public static String getUserId() {
        return userId;
    }

    public static void setUserId(String userId) {
        App.userId = userId;
    }
}
