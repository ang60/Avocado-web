package com.avocado.android.utils;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateTimeManager {

    private DateTimeManager() {}

    public static String convertEpochToDateTime(long epochMillis) {

        // convert using device default timezone
        LocalDateTime dt = Instant.ofEpochMilli(epochMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("EEE, MMM dd, yyyy 'at' HH:mm");

        return dt.format(formatter);
    }

    public static long convertDateTimeToEpoch(String dateTimeString) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("EEE, MMM dd, yyyy 'at' HH:mm");

        LocalDateTime dt = LocalDateTime.parse(dateTimeString, formatter);
        return dt.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    public static String convertEpochToDate(long epochMillis) {

        // convert using device default timezone
        LocalDateTime dt = Instant.ofEpochMilli(epochMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("MMM dd, yyyy");

        return dt.format(formatter);
    }

    public static long convertDateToEpoch(String dateString) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("MMM dd, yyyy");

        LocalDate date = LocalDate.parse(dateString, formatter);

        return date.atStartOfDay(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
    }

    public static String convertEpochToDate2(long epochMillis) {

        // convert using device default timezone
        LocalDateTime dt = Instant.ofEpochMilli(epochMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return dt.format(formatter);
    }

    public static long convertDateToEpoch2(String dateString) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDate date = LocalDate.parse(dateString, formatter);

        return date.atStartOfDay(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
    }

    public static String duration(long startEpochMillis, long endEpochMillis) {

        if (endEpochMillis < startEpochMillis) {
            return "Invalid duration";
        }

        Duration duration = Duration.between(
                Instant.ofEpochMilli(startEpochMillis),
                Instant.ofEpochMilli(endEpochMillis)
        );

        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;

        if (days > 0) {
            return days + " days " + hours + " hrs " + minutes + "min";
        } else if (hours > 0) {
            return hours + " hrs " + minutes + " min";
        } else {
            return minutes + " min";
        }
    }
}
