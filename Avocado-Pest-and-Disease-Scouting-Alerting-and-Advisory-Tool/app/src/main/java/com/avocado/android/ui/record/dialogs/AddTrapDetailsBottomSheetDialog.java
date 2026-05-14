package com.avocado.android.ui.record.dialogs;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddTrapDetailsBinding;
import com.avocado.android.ui.views.PestsObservedView;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.util.Objects;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class AddTrapDetailsBottomSheetDialog extends BottomSheetDialogFragment {

    DialogAddTrapDetailsBinding binding;
    OnDialogListener listener;

    public AddTrapDetailsBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAddTrapDetailsBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupListeners(view);
        binding.dialogAddTrapDetailsPestsObservedTextView.setVisibility(View.GONE);
    }

    @Override
    public void onResume() {
        super.onResume();

        if (getArguments() == null)
            return;

        binding.dialogAddTrapDetailsTitleTextView.setText("Add " + getArguments().getString("title"));
        binding.dialogAddTrapDetailsSubTitleTextView.setText(getArguments().getString("subTitle"));
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setupListeners(View view) {
        binding.dialogAddNewTrapDetailsNumberOfTrapsInstalledEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void afterTextChanged(Editable editable) {
                if (editable.toString().isEmpty()) {
                    binding.dialogAddTrapDetailsPestsObservedTextView.setVisibility(View.GONE);
                    binding.dialogAddTrapDetailsPestsObservedLinearLayout.removeAllViews();
                }
                else {
                    binding.dialogAddTrapDetailsPestsObservedTextView.setVisibility(View.VISIBLE);
                    addNumberOfPestsObserved(Integer.parseInt(editable.toString()));
                }
            }

            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }
        });

        binding.dialogAddNewTrapDetailsCancelButton.setOnClickListener(v -> dismiss());
        binding.dialogAddNewTrapDetailsAddButton.setOnClickListener(v -> {
            if (listener != null) {
                if (binding.dialogAddNewTrapDetailsNumberOfTrapsInstalledEditText.getText().toString().isEmpty()) {
                    dismiss();
                    return;
                }

                int numberOfTraps = Integer.parseInt(binding.dialogAddNewTrapDetailsNumberOfTrapsInstalledEditText.getText().toString());
                int numberOfPests = getTotalNumberOfPests();
                listener.onAddButtonClicked(getArguments().getString("title", "Trap"), numberOfTraps, numberOfPests);
            }

            dismiss();
        });
    }

    private void addNumberOfPestsObserved(int numberOfPests) {
        binding.dialogAddTrapDetailsPestsObservedLinearLayout.removeAllViews();
        for (int i = 0; i < numberOfPests; i++) {
            addPestObservedView(i+1);
        }
    }

    private void addPestObservedView(int i) {
        PestsObservedView pestsObservedView = new PestsObservedView(requireContext());
        pestsObservedView.setTitle("Pest observed on trap " + i);
        binding.dialogAddTrapDetailsPestsObservedLinearLayout.addView(pestsObservedView);
    }

    private int getTotalNumberOfPests() {
        int total = 0;
        for (int i = 0; i < binding.dialogAddTrapDetailsPestsObservedLinearLayout.getChildCount(); i++) {
            PestsObservedView pestsObservedView = (PestsObservedView) binding.dialogAddTrapDetailsPestsObservedLinearLayout.getChildAt(i);
            total += pestsObservedView.getValueAsInt();
        }
        return total;
    }

    public void setOnDialogListener(OnDialogListener listener) {
        this.listener = listener;
    }

    public interface OnDialogListener {
        void onAddButtonClicked(String trapName, int numberOfTraps, int numberOfPests);
    }
}
