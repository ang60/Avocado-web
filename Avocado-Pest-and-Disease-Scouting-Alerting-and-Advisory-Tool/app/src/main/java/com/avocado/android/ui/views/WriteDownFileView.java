package com.avocado.android.ui.views;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

public class WriteDownFileView extends LinearLayout {

    private ImageView imageView;
    private ImageView cancelImageView;
    private TextView descriptionTextView;

    public WriteDownFileView(Context context) {
        super(context);
        init(context);
    }

    public WriteDownFileView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public WriteDownFileView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.file_write_down_layout, this);

        setClickable(true);
        setFocusable(true);

        imageView = findViewById(R.id.file_write_down_image);
        cancelImageView = findViewById(R.id.file_write_down_cancel_image_view);
        descriptionTextView = findViewById(R.id.file_write_down_description_text_view);
    }

    public void setDescription(String description) {
        descriptionTextView.setText(description);
    }

    public void setOnImageClickListener(OnClickListener listener) {
        imageView.setOnClickListener(listener);
    }

    public void setOnCancelClickListener(OnClickListener listener) {
        cancelImageView.setOnClickListener(listener);
    }
}
