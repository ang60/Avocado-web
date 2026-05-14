package com.avocado.android.ui.record.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddOtherPestBinding;
import com.avocado.android.databinding.DialogIDontKnowWriteDownBinding;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class IdontKnowWriteDownBottomSheetDialog extends BottomSheetDialogFragment {

    OnWriteListener onWriteListener;

    DialogIDontKnowWriteDownBinding binding;

    public IdontKnowWriteDownBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogIDontKnowWriteDownBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogIDontKnowWriteDownCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.dialogIDontKnowWriteDownDescriptionEditText.setText("");
                dismiss();
            }
        });

        binding.dialogIDontKnowWriteDownSaveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                onWriteListener.onSaveWriteDown(binding.dialogIDontKnowWriteDownDescriptionEditText.getText().toString());
                binding.dialogIDontKnowWriteDownDescriptionEditText.setText("");
                dismiss();
            }
        });

        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    public void setOnWriteListener(OnWriteListener onWriteListener) {
        this.onWriteListener = onWriteListener;
    }
}
