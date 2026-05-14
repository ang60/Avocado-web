package com.avocado.android.ui.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.avocado.android.R;

import androidx.annotation.Nullable;

public class TrapUseView extends LinearLayout {

    private TextView trapNameTextView;
    private TextView numberOfPestsTextView;
    private ImageView editImageView;
    private ImageView deleteImageView;

    private int numberOfTraps;
    private int numberOfPestsObserved;

    public TrapUseView(Context context) {
        super(context);
        init(context);
    }

    public TrapUseView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public TrapUseView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.trap_use_layout, this, true);

        trapNameTextView = findViewById(R.id.trap_use_layout_trap_name_text_view);
        numberOfPestsTextView = findViewById(R.id.trap_use_layout_number_of_pests_text_view);
        editImageView = findViewById(R.id.trap_use_layout_edit_image_view);
        deleteImageView = findViewById(R.id.trap_use_layout_delete_image_view);

        editImageView.setVisibility(View.GONE);

        setOrientation(VERTICAL);
    }

    public void setTrapName(String name) {
        trapNameTextView.setText(name);
    }

    public void setNumberOfPestsTextView(String numberOfPests) {
        numberOfPestsTextView.setText(numberOfPests);
    }

    public void setOnEditClickListener(OnClickListener listener) {
        editImageView.setOnClickListener(listener);
    }

    public void setOnDeleteClickListener(OnClickListener listener) {
        deleteImageView.setOnClickListener(listener);
    }

    public void setOnItemClickListener(OnClickListener listener) {
        this.setOnClickListener(listener);
    }

    public String getTrapName() {
        return trapNameTextView.getText().toString();
    }

    public int getNumberOfTraps() {
        return numberOfTraps;
    }

    public void setNumberOfTraps(int numberOfTraps) {
        this.numberOfTraps = numberOfTraps;
    }

    public int getNumberOfPestsObserved() {
        return numberOfPestsObserved;
    }

    public void setNumberOfPestsObserved(int numberOfPestsObserved) {
        this.numberOfPestsObserved = numberOfPestsObserved;
    }
}
