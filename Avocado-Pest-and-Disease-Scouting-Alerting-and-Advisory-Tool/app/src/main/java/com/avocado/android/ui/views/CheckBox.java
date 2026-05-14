package com.avocado.android.ui.views;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.LinearLayout;

public abstract class CheckBox extends LinearLayout {

    public CheckBox(Context context) {
        super(context);
    }

    public CheckBox(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public abstract void setChecked(boolean checked);

    public abstract boolean isChecked();

    public abstract String getText();

    public abstract void setOnCheckedChangeListener(OnCheckedChangeListener l);

    public interface OnCheckedChangeListener {
        void onCheckedChanged(CheckBox view, boolean isChecked);
    }
}
