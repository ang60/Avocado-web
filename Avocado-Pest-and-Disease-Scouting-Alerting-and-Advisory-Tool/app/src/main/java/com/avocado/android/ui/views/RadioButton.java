package com.avocado.android.ui.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

public abstract class RadioButton extends LinearLayout {

    public RadioButton(Context context) {
        super(context);
    }

    public RadioButton(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public abstract void setChecked(boolean checked);

    public abstract boolean isChecked();

    public abstract String getText();

    public abstract void setOnCheckedChangeListener(OnCheckedChangeListener l);

    public interface OnCheckedChangeListener {
        void onCheckedChanged(RadioButton view, boolean isChecked);
    }
}
