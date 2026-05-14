package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.net.Uri;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;

import androidx.core.content.ContextCompat;

public class CheckBoxThree extends CheckBox {

    private boolean isChecked = false;
    private OnCheckedChangeListener listener;

    private final Context context;

    private LinearLayout linearLayout;
    private ImageView imageView;
    private TextView titleTextView;
    private TextView subTitleTextView;

    public CheckBoxThree(Context context) {
        super(context);
        this.context = context;
        init(null);
    }

    public CheckBoxThree(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        View view = LayoutInflater.from(context).inflate(R.layout.checkbox_three_layout, this, true);

        this.linearLayout = view.findViewById(R.id.checkbox_three_linear_layout);
        this.imageView = view.findViewById(R.id.checkbox_three_image_view);
        this.titleTextView = view.findViewById(R.id.checkbox_three_title_text_view);
        this.subTitleTextView = view.findViewById(R.id.checkbox_three_sub_title_text_view);

        setClickable(true);
        setPadding(0, 0, 0, 0);
        updateUI();

        setOnClickListener(v -> {
            setChecked(!isChecked);
            if (listener != null) listener.onCheckedChanged(this, isChecked);
        });

        if (attrs == null)
            return;

        TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.CheckBoxThree);

        int image = a.getResourceId(R.styleable.CheckBoxThree_image, 0);
        String title = a.getString(R.styleable.CheckBoxThree_title);
        String subTitle = a.getString(R.styleable.CheckBoxThree_sub_title);

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
        //imageView.setImageResource(resId);
        Glide.with(context)
                .load(resId)
                .placeholder(ContextCompat.getDrawable(context, resId))
                .centerCrop()
                //.transform(new RoundedCorners(dpToPx(24)))
                .into(imageView);
    }

    public void setImageUri(Uri uri) {
        //imageView.setImageResource(resId);
        Glide.with(context)
                .load(uri)
                .centerCrop()
                //.transform(new RoundedCorners(dpToPx(24)))
                .into(imageView);
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

    public String getSubTitle() {
        return subTitleTextView.getText().toString();
    }

    private void updateUI() {
        if (isChecked) {
            linearLayout.setBackgroundResource(R.drawable.layout_background_9);
            subTitleTextView.setVisibility(View.VISIBLE);
        } else {
            linearLayout.setBackgroundResource(R.drawable.layout_background_8);
            subTitleTextView.setVisibility(View.INVISIBLE);
            subTitleTextView.setText("");
        }
    }

    public void setOnCheckedChangeListener(OnCheckedChangeListener l) {
        this.listener = l;
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }
}
