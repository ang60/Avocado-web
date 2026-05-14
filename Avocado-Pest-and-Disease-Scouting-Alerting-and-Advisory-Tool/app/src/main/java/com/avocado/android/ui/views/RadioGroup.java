package com.avocado.android.ui.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.IdRes;

public class RadioGroup extends LinearLayout {

    private RadioButton radioButton;

    // Listener interface
    public interface OnCheckedChangeListener {
        void onCheckedChanged(RadioGroup group, RadioButton checkedButton, @IdRes int checkedId);
    }

    private OnCheckedChangeListener listener;

    public RadioGroup(Context context) {
        super(context);
    }

    public RadioGroup(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    // Setter for listener
    public void setOnCheckedChangeListener(OnCheckedChangeListener listener) {
        this.listener = listener;
    }

    @Override
    protected void onFinishInflate() {
        super.onFinishInflate();

        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);

            if (child instanceof RadioButton) {
                RadioButton radio = (RadioButton) child;

                radio.setOnCheckedChangeListener((view, isChecked) -> {
                    if (isChecked) {
                        if (radioButton != null && radioButton != view) {
                            radioButton.setChecked(false);
                        }

                        radioButton = (RadioButton) view;

                        // Notify listener
                        if (listener != null) {
                            listener.onCheckedChanged(this, radioButton, radioButton.getId());
                        }
                    }
                });
            }
        }
    }

    public RadioButton getCheckedRadioButton() {
        return radioButton;
    }

    public String getCheckedRadioButtonText() {
        if (radioButton == null)
            return "";
        else
            return radioButton.getText().toString();
    }
}