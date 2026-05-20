package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

import androidx.core.content.ContextCompat;

public class RadioButtonSixteen extends RadioButton {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView titleTextView;
    private TextView subTitleTextView;

    public RadioButtonSixteen(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public RadioButtonSixteen(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.radio_button_sixteen_layout, this, true);

        this.linearLayout = view.findViewById(R.id.radio_button_sixteen_linear_layout);
        this.imageView = view.findViewById(R.id.radio_button_sixteen_image);
        this.titleTextView = view.findViewById(R.id.radio_button_sixteen_title_text);
        this.subTitleTextView = view.findViewById(R.id.radio_button_sixteen_sub_title_text);

        setClickable(true);
        setPadding(0, 0, 0, 0);

        setOnClickListener(v -> {
            if (!isChecked) {
                setChecked(true);
                if (listener != null) listener.onCheckedChanged(this, true);
            }
        });

        if (attrs == null)
            return;

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.RadioButtonSixteen);

        int image = a.getResourceId(R.styleable.RadioButtonSixteen_image, 0);
        String title = a.getString(R.styleable.RadioButtonSixteen_title);
        String subTitle = a.getString(R.styleable.RadioButtonSixteen_sub_title);

        // Use the retrieved values to configure your view
        setImageResource(image);
        setTitle(title);
        setSubTitle(subTitle);

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

    public void setSubTitle(String subTitle) {
        subTitleTextView.setText(subTitle);
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_7);
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_6);
        }
    }
}
