package com.avocado.android.ui.start.createaccount;

/**
 * Stateless utility class for password validation and strength evaluation.
 * Keeps all password logic out of the Fragment and ViewModel.
 */
public class PasswordValidator {

    private static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";

    private PasswordValidator() {
        // Utility class — no instantiation
    }

    /**
     * Returns true if the password meets all requirements:
     * at least 8 chars, one uppercase, one lowercase, one digit, one special char.
     */
    public static boolean isValid(String password) {
        return password != null && password.matches(PASSWORD_REGEX);
    }

    /**
     * Evaluates and returns the strength of the given password.
     * Score breakdown:
     *   +1  length >= 8
     *   +1  length >= 12 (bonus)
     *   +1  contains uppercase
     *   +1  contains lowercase
     *   +1  contains digit
     *   +1  contains special character
     *
     * Score 0-2 → WEAK, 3-4 → MODERATE, 5 → GOOD, 6 → STRONG
     */
    public static PasswordStrength evaluate(String password) {
        if (password == null || password.isEmpty()) {
            return PasswordStrength.WEAK;
        }

        int score = 0;

        if (password.length() >= 8)  score++;
        if (password.length() >= 12) score++;
        if (password.matches(".*[A-Z].*")) score++;
        if (password.matches(".*[a-z].*")) score++;
        if (password.matches(".*\\d.*"))   score++;
        if (password.matches(".*[^A-Za-z0-9].*")) score++;

        if (score <= 2) return PasswordStrength.WEAK;
        if (score <= 4) return PasswordStrength.MODERATE;
        if (score == 5) return PasswordStrength.GOOD;
        return PasswordStrength.STRONG;
    }

    // --- Individual requirement checkers (used to drive UI requirement indicators) ---

    public static boolean hasMinLength(String password) {
        return password != null && password.length() >= 8;
    }

    public static boolean hasUppercase(String password) {
        return password != null && password.matches(".*[A-Z].*");
    }

    public static boolean hasLowercase(String password) {
        return password != null && password.matches(".*[a-z].*");
    }

    public static boolean hasDigit(String password) {
        return password != null && password.matches(".*\\d.*");
    }

    public static boolean hasSpecialChar(String password) {
        return password != null && password.matches(".*[^A-Za-z0-9].*");
    }
}
