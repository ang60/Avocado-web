package com.avocado.android.utils;

import com.avocado.android.App;

public class Config {

    public static String getFormattedString(String original, String regex, String replacement) {
        return original.replaceAll(regex, replacement);
    }

    public static String getBaseDirectory() {
        if (App.getUserId().isEmpty()) {
            return "avocado";
        }
        else {
            return "avocado/" + App.getUserId();
        }
    }
}
