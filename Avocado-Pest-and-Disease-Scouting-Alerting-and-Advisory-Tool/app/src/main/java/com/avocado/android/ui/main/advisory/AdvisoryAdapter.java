package com.avocado.android.ui.main.advisory;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Block;
import com.avocado.android.databinding.AdvisoryLayoutBinding;
import com.avocado.android.databinding.ManageBlockLayoutBinding;
import com.avocado.android.ui.manageblocks.BlocksAdapter;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class AdvisoryAdapter extends RecyclerView.Adapter<AdvisoryAdapter.ViewHolder> implements Filterable {

    public interface AdvisoryListener {
        void onAdvisoryClick(Advisory advisory, int position);
        void onAdvisoryRecordActionClick(Advisory advisory, int position);
    }

    private List<Advisory> advisoryList;
    private List<Advisory> advisoryListFull;
    private final AdvisoryListener advisoryListener;

    public AdvisoryAdapter(AdvisoryAdapter.AdvisoryListener advisoryListener) {
        this.advisoryList = new ArrayList<>();
        this.advisoryListFull = new ArrayList<>();
        this.advisoryListener = advisoryListener;
    }

    public void setAdvisoryList(List<Advisory> advisoryList) {
        this.advisoryList = advisoryList;
        notifyDataSetChanged();
    }

    public void setAdvisoryListFull(List<Advisory> advisoryList) {
        this.advisoryListFull = new ArrayList<>(advisoryList);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        AdvisoryLayoutBinding binding = AdvisoryLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return advisoryList.size();
    }

    private Advisory getItem(int position) {
        return advisoryList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        AdvisoryLayoutBinding binding;

        ViewHolder(AdvisoryLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            Advisory advisory = getItem(position);
            String advisoryMessage = advisory.getAdvisoryMessage();
            String actionTakenStatus = advisory.getActionTakenStatus();

            String [] advisoryMessageParts = advisoryMessage.split(":\\n");
            String [] titleParts = advisoryMessageParts[0].split(" - ");
            String title = titleParts[0];
            String subTitle = titleParts[1];
            String message = advisoryMessageParts[1];
            boolean showResolved = !actionTakenStatus.equals("In Progress");
            String action = showResolved ? "ACTIONS TAKEN" : "ACTION REQUIRED";
            boolean showRecordActionButton = actionTakenStatus.equals("In Progress");

            if (!advisory.getActionsTaken().equals("null") && !advisory.getOutcome().equals("null")) {
                showResolved = true; // show resolved if actions taken and outcome are not null
                showRecordActionButton = false; // hide record action button if resolved
            }

            setLogo(0);
            setTitle(title);
            setSubTitle(subTitle);
            setResolved(showResolved);
            setAction(action);
            setMessage(message);
            setDate(advisory.getTimeAgo());
            setRecordActionButton(showRecordActionButton);
            setRecordActionClickListener(advisory);
            setClickListener(advisory);
        }


        private void setLogo(int resource) {
            // binding.advisoryLayoutLogoImageView.setImageResource(resource);
        }

        private void setTitle(String title) {
            binding.advisoryLayoutTitleTextView.setText(title);
        }

        private void setSubTitle(String subTitle) {
            binding.advisoryLayoutSubTitleTextView.setText(subTitle);
        }

        private void setResolved(boolean show) {
            binding.advisoryLayoutResolvedTextView.setVisibility(show ? View.VISIBLE : View.GONE);
        }

        private void setAction(String action) {
            binding.advisoryLayoutActionTextView.setText(action);
        }

        private void setMessage(String message) {
            binding.advisoryLayoutMessageTextView.setText(message);
        }

        private void setDate(String date) {
            binding.advisoryLayoutDateTextView.setText(date);
        }

        private void setRecordActionButton(boolean show) {
            binding.advisoryLayoutRecordActionButton.setVisibility(show ? View.VISIBLE : View.GONE);
        }

        private void setClickListener(Advisory advisory) {
            itemView.setTag(advisory);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        private void setRecordActionClickListener(Advisory advisory) {
            binding.advisoryLayoutRecordActionButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    advisoryListener.onAdvisoryRecordActionClick(advisory, getAbsoluteAdapterPosition());
                }
            });
        }

        @Override
        public void onClick(View view) {
            advisoryListener.onAdvisoryClick((Advisory) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<Advisory> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(advisoryListFull);
            }
            else if (constraint.toString().equalsIgnoreCase("Action Required")) {
                for (Advisory advisory : advisoryListFull) {
                    if (advisory.getCategory().equalsIgnoreCase("Action Required")) {
                        filteredList.add(advisory);
                    }
                }
            }
            else if (constraint.toString().equalsIgnoreCase("Completed")) {
                for (Advisory advisory : advisoryListFull) {
                    if (advisory.getCategory().equalsIgnoreCase("Completed")) {
                        filteredList.add(advisory);
                    }
                }
            }
            else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (Advisory advisory : advisoryListFull) {
                    if (advisory.getAdvisoryMessage().toLowerCase().contains(filterPattern)) {
                        filteredList.add(advisory);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            advisoryList.clear();
            advisoryList.addAll((List<Advisory>) results.values);
            notifyDataSetChanged();
        }
    };
}
