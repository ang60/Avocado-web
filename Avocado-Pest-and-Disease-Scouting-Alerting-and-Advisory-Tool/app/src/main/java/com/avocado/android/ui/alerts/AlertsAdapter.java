package com.avocado.android.ui.alerts;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.R;
import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Alert;
import com.avocado.android.databinding.AdvisoryLayoutBinding;
import com.avocado.android.databinding.AlertsLayoutBinding;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

public class AlertsAdapter extends RecyclerView.Adapter<AlertsAdapter.ViewHolder> implements Filterable {

    public interface AlertsListener {
        void onAlertsClick(Alert alert, int position);
        void onAlertsClearClick(Alert alert, int position);
    }

    private List<Alert> alertsList;
    private List<Alert> alertsListFull;
    private final AlertsListener alertsListener;

    public AlertsAdapter(AlertsAdapter.AlertsListener alertsListener) {
        this.alertsList = new ArrayList<>();
        this.alertsListFull = new ArrayList<>();
        this.alertsListener = alertsListener;
    }

    public void setAlertsList(List<Alert> alertsList) {
        this.alertsList = alertsList;
        notifyDataSetChanged();
    }

    public void setAlertsListFull(List<Alert> alertsList) {
        this.alertsListFull = new ArrayList<>(alertsList);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        AlertsLayoutBinding binding = AlertsLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return alertsList.size();
    }

    private Alert getItem(int position) {
        return alertsList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        AlertsLayoutBinding binding;

        ViewHolder(AlertsLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            Alert alert = getItem(position);
            String title = alert.getTitle();
            String message = alert.getMessage();
            String timeAgo = alert.getTimeAgo();

            Drawable logo = getLogo(binding.getRoot().getContext(), alert);
            int logoBackground = getLogoBackground(alert);
            int background = getBackground(alert);

            setLogo(logo);
            setLogoTint(alert, R.color.alert_warning_tint_color);
            setLogoBackground(logoBackground);
            setBackground(background);
            setTitle(title);
            setSubTitle(message);
            setDate(timeAgo);
            setClearVisibility(alert.isRead());
            setClearClickListener(alert);
            setClickListener(alert);
        }

        private void setLogo(Drawable drawable) {
            binding.alertsLayoutLogoImageView.setImageDrawable(drawable);
        }

        private void setLogoTint(Alert alert, int resource) {
            if (alert.getTitle().contains("Urgent") || alert.getTitle().contains("Area") || alert.getTitle().contains("Ready"))
                return;

            binding.alertsLayoutLogoImageView.setImageTintList(ContextCompat.getColorStateList(binding.getRoot().getContext(), resource));
        }

        private void setLogoBackground(int resource) {
            binding.alertsLayoutLogoImageView.setBackgroundResource(resource);
        }

        private void setBackground(int resource) {
            binding.alertsLayoutLinearLayout.setBackgroundResource(resource);
        }

        private void setTitle(String title) {
            binding.alertsLayoutTitleTextView.setText(title);
        }

        private void setSubTitle(String subTitle) {
            binding.alertsLayoutSubTitleTextView.setText(subTitle);
        }

        private void setDate(String date) {
            binding.alertsLayoutDateTextView.setText(date);
        }

        private void setClearVisibility(boolean isRead) {
            if (isRead)
                binding.alertsLayoutClearImageView.setVisibility(View.INVISIBLE);
            else
                binding.alertsLayoutClearImageView.setVisibility(View.VISIBLE);
        }

        private void setClickListener(Alert alert) {
            itemView.setTag(alert);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        private void setClearClickListener(Alert alert) {
            binding.alertsLayoutClearImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    alertsListener.onAlertsClearClick(alert, getAbsoluteAdapterPosition());
                }
            });
        }

        private Drawable getLogo(Context context, Alert alert) {
            if (alert.getTitle().contains("Ready"))
                return ContextCompat.getDrawable(context, R.drawable.ic_check);
            else if (alert.getTitle().contains("Area"))
                return ContextCompat.getDrawable(context, R.drawable.ic_pin);
            else if (alert.getTitle().contains("Urgent"))
                return ContextCompat.getDrawable(context, R.drawable.ic_red_circle);
            else
                return ContextCompat.getDrawable(context, R.drawable.ic_warning_24dp);
        }

        private int getLogoBackground(Alert alert) {
            if (alert.getTitle().contains("Ready"))
                return R.drawable.image_background_6;
            else if (alert.getTitle().contains("Area"))
                return R.drawable.image_background_7;
            else if (alert.getTitle().contains("Urgent"))
                return R.drawable.image_background_11;
            else
                return R.drawable.image_background_5;
        }

        private int getBackground(Alert alert) {
            if (alert.getTitle().contains("Ready"))
                return R.drawable.layout_background_4;
            else if (alert.getTitle().contains("Area"))
                return R.drawable.layout_background_5;
            else if (alert.getTitle().contains("Urgent"))
                return R.drawable.layout_background_23;
            else
                return R.drawable.layout_background_3;
        }

        @Override
        public void onClick(View view) {
            alertsListener.onAlertsClick((Alert) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<Alert> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(alertsListFull);
            }
            else if (constraint.toString().equalsIgnoreCase("Unread")) {
                for (Alert alert : alertsListFull) {
                    if (!alert.isRead()) {
                        filteredList.add(alert);
                    }
                }
            }
            else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (Alert alert : alertsListFull) {
                    if (alert.getMessage().toLowerCase().contains(filterPattern)) {
                        filteredList.add(alert);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            alertsList.clear();
            alertsList.addAll((List<Alert>) results.values);
            notifyDataSetChanged();
        }
    };
}
