package com.avocado.android.ui.views;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.AttributeSet;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.avocado.android.R;

public class AudioFileView extends LinearLayout {

    private ImageView imageView;
    private ImageView cancelImageView;
    private TextView descriptionTextView;

    private Uri audioUri;

    public AudioFileView(Context context) {
        super(context);
        init(context);
    }

    public AudioFileView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AudioFileView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.file_audio_layout, this);

        setClickable(true);
        setFocusable(true);

        imageView = findViewById(R.id.file_audio_image);
        cancelImageView = findViewById(R.id.file_audio_cancel_image_view);
        descriptionTextView = findViewById(R.id.file_audio_text_view);

        // Whole view click → open audio externally
        super.setOnClickListener(v -> playAudio());
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

    public void setAudioUri(Uri uri) {
        this.audioUri = uri;
    }

    public void setAudioFilePath(String filePath) {
        this.audioUri = Uri.parse(filePath);
    }

    private void playAudio() {
        if (audioUri == null) return;

        Context context = getContext();

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(audioUri, "audio/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        try {
            context.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(context, "No app found to play audio", Toast.LENGTH_SHORT).show();
        }
    }
}
