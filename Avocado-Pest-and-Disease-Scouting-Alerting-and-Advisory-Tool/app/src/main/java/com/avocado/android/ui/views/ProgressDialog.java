package com.avocado.android.ui.views;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;

import com.avocado.android.R;

import androidx.appcompat.app.AlertDialog;

public class ProgressDialog {

    private AlertDialog alertDialog;
    private TextView messageTextView;

    private ProgressDialog(Context context, String message) {
        View view = LayoutInflater.from(context)
                .inflate(R.layout.progress_dialog, null);

        messageTextView = view.findViewById(R.id.progress_dialog_message_text_view);
        messageTextView.setText(message);

        alertDialog = new AlertDialog.Builder(context)
                .setView(view)
                .setCancelable(true)
                .create();
    }

    public void setMessage(String message) {
        if (messageTextView != null) {
            messageTextView.setText(message);
        }
    }

    public void show() {
        if (alertDialog != null && !alertDialog.isShowing()) {
            alertDialog.show();
        }
    }

    public void dismiss() {
        if (alertDialog != null && alertDialog.isShowing()) {
            alertDialog.dismiss();
        }
    }

    public boolean isShowing() {
        return alertDialog != null && alertDialog.isShowing();
    }

    // Factory method
    public static ProgressDialog create(Context context, String message) {
        return new ProgressDialog(context, message);
    }
}

