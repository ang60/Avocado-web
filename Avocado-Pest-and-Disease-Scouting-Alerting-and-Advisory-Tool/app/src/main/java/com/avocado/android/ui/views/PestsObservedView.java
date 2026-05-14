package com.avocado.android.ui.views;

import android.content.Context;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.LinearLayout;

import androidx.annotation.Nullable;

import com.avocado.android.R;
import com.google.android.material.textfield.TextInputEditText;
import android.widget.TextView;

public class PestsObservedView extends LinearLayout {

    private TextView titleTextView;
    private TextInputEditText valueEditText;

    public PestsObservedView(Context context) {
        super(context);
        init(context);
    }

    public PestsObservedView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public PestsObservedView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.pests_observed_layout, this, true);

        titleTextView = findViewById(R.id.pests_observed_layout_title_textview);
        valueEditText = findViewById(R.id.pests_observed_layout_number_of_pests_observed_edit_text);
    }

    public void setTitle(String title) {
        titleTextView.setText(title);
    }

    public String getValue() {
        if (valueEditText.getText() != null) {
            return valueEditText.getText().toString().trim();
        }
        return "";
    }

    public int getValueAsInt() {
        String value = getValue();
        if (TextUtils.isEmpty(value)) return 0;

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public void setValue(String value) {
        valueEditText.setText(value);
    }
}
