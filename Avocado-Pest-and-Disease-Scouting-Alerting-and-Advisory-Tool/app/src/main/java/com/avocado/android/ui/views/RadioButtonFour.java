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

public class RadioButtonFour extends RadioButton {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView textView;

    public RadioButtonFour(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public RadioButtonFour(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.radio_button_four_layout, this, true);

        this.linearLayout = view.findViewById(R.id.radio_button_four_linear_layout);
        this.imageView = view.findViewById(R.id.radio_button_four_image);
        this.textView = view.findViewById(R.id.radio_button_four_text);

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

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.RadioButtonFour);

        int image = a.getResourceId(R.styleable.RadioButtonFour_image, 0);
        String text = a.getString(R.styleable.RadioButtonFour_text);

        // Use the retrieved values to configure your view
        setImageResource(image);
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

    public void setImageResource(int resId) {
        imageView.setImageResource(resId);
    }

    public String getText() {
        return textView.getText().toString();
    }

    public void setText(String text) {
        textView.setText(text);
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_7);
            textView.setTextColor(ContextCompat.getColor(getContext(), R.color.sage));
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_6);
            textView.setTextColor(ContextCompat.getColor(getContext(), R.color.slate));
        }
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }
}
