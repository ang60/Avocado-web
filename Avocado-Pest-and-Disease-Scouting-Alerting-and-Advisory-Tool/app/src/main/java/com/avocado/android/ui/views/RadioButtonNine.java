package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

import androidx.core.content.ContextCompat;

public class RadioButtonNine extends RadioButton {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private TextView textView;

    public RadioButtonNine(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public RadioButtonNine(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.radio_button_nine_layout, this, true);

        this.linearLayout = view.findViewById(R.id.radio_button_nine_linear_layout);
        this.textView = view.findViewById(R.id.radio_button_nine_text);

        setClickable(true);
        setPadding(0, 0, 0, 0);
        updateUI();

        setOnClickListener(v -> {
            if (!isChecked) {
                setChecked(true);
                if (listener != null) listener.onCheckedChanged(this, true);
            }
        });

        if (attrs == null)
            return;

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.RadioButtonNine);

        String text = a.getString(R.styleable.RadioButtonNine_text);

        // Use the retrieved values to configure your view
        setText(text);

        a.recycle(); // Important: Recycle the TypedArray
    }

    public void setChecked(boolean checked) {
        isChecked = checked;
        updateUI();
    }

    public boolean isChecked() {
        return isChecked;
    }

    public String getText() {
        return textView.getText().toString();
    }

    public void setText(String text) {
        textView.setText(text);
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_20);
            textView.setTextColor(ContextCompat.getColor(context, R.color.white));
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_12);
            textView.setTextColor(ContextCompat.getColor(context, R.color.slate));
        }
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }
}
