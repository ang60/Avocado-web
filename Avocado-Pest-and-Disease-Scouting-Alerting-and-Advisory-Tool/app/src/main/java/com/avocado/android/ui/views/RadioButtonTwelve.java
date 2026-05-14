package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Checkable;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

public class RadioButtonTwelve extends RadioButton {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView titleTextView;
    private TextView subtitleTextView;

    public RadioButtonTwelve(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public RadioButtonTwelve(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.radio_button_twelve_layout, this, true);

        this.linearLayout = view.findViewById(R.id.radio_button_twelve_linear_layout);
        this.imageView = view.findViewById(R.id.radio_button_twelve_image_view);
        this.titleTextView = view.findViewById(R.id.radio_button_twelve_title_text_view);
        this.subtitleTextView = view.findViewById(R.id.radio_button_twelve_sub_title_text_view);

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

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.RadioButtonTwelve);

        int image = a.getResourceId(R.styleable.RadioButtonTwelve_image, 0);
        String title = a.getString(R.styleable.RadioButtonTwelve_title);
        String subtitle = a.getString(R.styleable.RadioButtonTwelve_sub_title);

        // Use the retrieved values to configure your view
        setImageResource(image);
        setTitle(title);
        setSubtitle(subtitle);

        a.recycle(); // Important: Recycle the TypedArray
    }

    public void setChecked(boolean checked) {
        isChecked = checked;
        updateUI();
    }

    public boolean isChecked() {
        return isChecked;
    }

    public void setImageResource(int resId) {
        imageView.setImageResource(resId);
    }

    public String getText() {
        return titleTextView.getText().toString();
    }

    public void setTitle(String title) {
        titleTextView.setText(title);
    }

    public void setSubtitle(String subtitle) {
        subtitleTextView.setText(subtitle);
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_25);
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_19);
        }
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }
}
