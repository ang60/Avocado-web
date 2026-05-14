package com.avocado.android.ui.start.intro;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.R;
import com.avocado.android.databinding.FragmentStartIntroBinding;
import com.avocado.android.ui.main.MainActivity;
import com.avocado.android.utils.TokenManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class IntroFragment extends Fragment {

    private FragmentStartIntroBinding binding;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartIntroBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setUpListeners(view);

        if (isLoggedIn()) {
            Intent intent = new Intent(requireActivity(), MainActivity.class);
            startActivity(intent);
            requireActivity().finish();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setUpListeners(View view) {
        binding.fragmentStartIntroEnglishButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_start_navigation_intro_to_create_account_fragment);
            }
        });

        binding.fragmentStartIntroSwahiliButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_start_navigation_intro_to_create_account_fragment);
            }
        });
    }

    private boolean isLoggedIn() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return !tokenManager.getAccessToken().isEmpty();
    }
}