package com.avocado.android.ui.audio;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.avocado.android.R;
import com.avocado.android.databinding.ActivityAudioRecorderBinding;

import java.io.File;
import java.io.IOException;

public class AudioRecorderActivity extends AppCompatActivity {

    private static final int REQUEST_MIC_PERMISSION = 1001;

    private ActivityAudioRecorderBinding binding;

    private MediaRecorder mRecorder;
    private MediaPlayer mPlayer;

    private String audioFilePath;

    private boolean isRecording = false;

    private int seconds = 0;

    private final Handler timerHandler = new Handler();

    private final Runnable timerRunnable = new Runnable() {
        @Override
        public void run() {
            if (isRecording) {
                seconds++;
                updateTimer();
                timerHandler.postDelayed(this, 1000);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityAudioRecorderBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.audioRecorderStatusText.setVisibility(View.INVISIBLE);
        binding.activityAudioRecorderCancelButton.setVisibility(View.INVISIBLE);
        binding.activityAudioRecorderDoneRecordingButton.setVisibility(View.INVISIBLE);

        audioFilePath = getCacheDir().getAbsolutePath() + "/recorded_audio.mp3";

        setupListeners();
    }

    private void setupListeners() {

        binding.activityAudioRecorderStartStopRecordingButton.setOnClickListener(v -> {

            if (!isRecording) {

                if (checkPermission()) {
                    startRecording();
                } else {
                    requestPermission();
                }

            } else {
                stopRecording();
            }

        });

        binding.activityAudioRecorderDoneRecordingButton.setOnClickListener(v -> {
            Uri audioUri = FileProvider.getUriForFile(this, getPackageName() +
                    ".provider", new File(audioFilePath));

            Intent resultIntent = new Intent();
            resultIntent.setData(audioUri);
            resultIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            setResult(RESULT_OK, resultIntent);
            finish();
        });

        binding.activityAudioRecorderCancelButton.setOnClickListener(v -> {
            finish();
        });
    }

    private void startRecording() {

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                mRecorder = new MediaRecorder(this);
            } else {
                mRecorder = new MediaRecorder();
            }

            mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            mRecorder.setOutputFile(audioFilePath);

            mRecorder.prepare();
            mRecorder.start();

            isRecording = true;
            seconds = 0;

            timerHandler.post(timerRunnable);

            binding.activityAudioRecorderStartStopRecordingButton.setText("Stop Recording");
            binding.audioRecorderStatusText.setText("Recording...");
            binding.audioRecorderStatusText.setVisibility(android.view.View.VISIBLE);
            binding.activityAudioRecorderCancelButton.setVisibility(View.INVISIBLE);
            binding.activityAudioRecorderDoneRecordingButton.setVisibility(View.INVISIBLE);
            binding.activityAudioRecorderMicImage.setImageResource(R.drawable.audio_mic_open);

            Toast.makeText(this, "Recording started", Toast.LENGTH_SHORT).show();

        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Failed to start recording", Toast.LENGTH_SHORT).show();
        }
    }

    private void stopRecording() {

        try {

            if (mRecorder != null) {
                mRecorder.stop();
                mRecorder.release();
                mRecorder = null;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        isRecording = false;

        timerHandler.removeCallbacks(timerRunnable);

        binding.activityAudioRecorderStartStopRecordingButton.setText("Start Recording");
        binding.audioRecorderStatusText.setText("Recording stopped");
        binding.activityAudioRecorderCancelButton.setVisibility(View.VISIBLE);
        binding.activityAudioRecorderDoneRecordingButton.setVisibility(View.VISIBLE);
        binding.activityAudioRecorderMicImage.setImageResource(R.drawable.audio_mic_close);

        // Toast.makeText(this, "Saved: " + audioFilePath, Toast.LENGTH_LONG).show();
    }

    private void updateTimer() {

        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        int secs = seconds % 60;

        String time = String.format("%02d:%02d:%02d", hours, minutes, secs);

        binding.audioRecorderProgressText.setText(time);
    }

    private boolean checkPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED;
    }

    private void requestPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO},
                REQUEST_MIC_PERMISSION);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_MIC_PERMISSION) {

            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startRecording();

            } else {
                Toast.makeText(this, "Microphone permission denied", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        timerHandler.removeCallbacks(timerRunnable);

        if (mRecorder != null) {
            mRecorder.release();
            mRecorder = null;
        }

        if (mPlayer != null) {
            mPlayer.release();
            mPlayer = null;
        }
    }
}