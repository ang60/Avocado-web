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

public class CheckBoxOneWithRemove extends CheckBox {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView textView;
    private ImageView clearImageView;

    public CheckBoxOneWithRemove(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public CheckBoxOneWithRemove(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.checkbox_one_with_remove_layout, this, true);

        this.linearLayout = view.findViewById(R.id.checkbox_one_with_remove_linear_layout);
        this.imageView = view.findViewById(R.id.checkbox_one_with_remove_image);
        this.textView = view.findViewById(R.id.checkbox_one_with_remove_text);
        this.clearImageView = view.findViewById(R.id.checkbox_one_with_remove_clear_image);

        setClickable(true);
        setPadding(0, 0, 0, 0);
        updateUI();

        setOnClickListener(v -> {
            setChecked(!isChecked);
            if (listener != null) listener.onCheckedChanged(this, isChecked);
        });

        if (attrs == null)
            return;

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.CheckBoxOne);

        int image = a.getResourceId(R.styleable.CheckBoxOne_image, 0);
        String text = a.getString(R.styleable.CheckBoxOne_text);

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

    public void setImageVisibility(int visibility) {
        imageView.setVisibility(visibility);
    }

    public String getText() {
        return textView.getText().toString();
    }

    public void setText(String text) {
        textView.setText(text);
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_28);
            textView.setTextColor(ContextCompat.getColor(getContext(), R.color.orange_text));
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_12);
            textView.setTextColor(ContextCompat.getColor(getContext(), R.color.slate));
        }
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }

    public void setOnClearClickListener(OnClickListener listener) {
        clearImageView.setOnClickListener(listener);
    }
}
