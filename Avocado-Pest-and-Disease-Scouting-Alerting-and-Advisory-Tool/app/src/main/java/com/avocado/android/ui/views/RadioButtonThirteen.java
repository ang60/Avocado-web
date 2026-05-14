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

public class RadioButtonThirteen extends RadioButton {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView titleTextView;
    private TextView subTitleTextView;

    public RadioButtonThirteen(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public RadioButtonThirteen(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.radio_button_thirteen_layout, this, true);

        this.linearLayout = view.findViewById(R.id.radio_button_thirteen_linear_layout);
        this.imageView = view.findViewById(R.id.radio_button_thirteen_image);
        this.titleTextView = view.findViewById(R.id.radio_button_thirteen_title_text);
        this.subTitleTextView = view.findViewById(R.id.radio_button_thirteen_sub_title_text);

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

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.RadioButtonThirteen);

        int image = a.getResourceId(R.styleable.RadioButtonThirteen_image, 0);
        String title = a.getString(R.styleable.RadioButtonThirteen_title);
        String subTitle = a.getString(R.styleable.RadioButtonThirteen_sub_title);

        // Use the retrieved values to configure your view
        setImageResource(image);
        setTitle(title);
        setSubTitle(subTitle);

        a.recycle(); // Important: Recycle the TypedArray
    }

    public void setChecked(boolean checked) {
        isChecked = checked;
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
}
