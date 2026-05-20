package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.IdRes;
import androidx.annotation.Nullable;

import com.avocado.android.R;

/**
 * A ViewGroup that arranges {@link RadioButton} children in an auto-fitting grid,
 * automatically calculating column count from a target column width, and enforcing
 * single-selection (radio) behaviour across all children.
 *
 * <p>Borrows:
 * <ul>
 *   <li>Grid measurement / layout engine from {@link AutoFitGridLayout}</li>
 *   <li>Radio-selection logic and listener contract from {@link RadioGroup}</li>
 * </ul>
 *
 * <p>XML attributes (declare in {@code res/values/attrs.xml}):
 * <pre>
 *   &lt;declare-styleable name="AutoFitGridRadioGroup"&gt;
 *       &lt;attr name="column_width"   format="dimension" /&gt;
 *       &lt;attr name="horizontal_spacing" format="dimension" /&gt;
 *       &lt;attr name="vertical_spacing"   format="dimension" /&gt;
 *   &lt;/declare-styleable&gt;
 * </pre>
 */
public class AutoFitGridRadioGroup extends ViewGroup {

    // -----------------------------------------------------------------------
    // Grid state  (from AutoFitGridLayout)
    // -----------------------------------------------------------------------

    private int columnWidth       = 0; // px; 0 means "not set — use equal split"
    private int horizontalSpacing = 0; // px
    private int verticalSpacing   = 0; // px
    private int spanCount         = 1; // computed in onMeasure

    // -----------------------------------------------------------------------
    // Radio state  (from RadioGroup)
    // -----------------------------------------------------------------------

    @Nullable
    private RadioButton checkedButton = null;

    // -----------------------------------------------------------------------
    // Listener  (from RadioGroup)
    // -----------------------------------------------------------------------

    public interface OnCheckedChangeListener {
        /**
         * Called whenever the checked {@link RadioButton} changes.
         *
         * @param group         the parent {@link AutoFitGridRadioGroup}
         * @param checkedButton the newly checked button
         * @param checkedId     the view id of the newly checked button
         */
        void onCheckedChanged(AutoFitGridRadioGroup group,
                              RadioButton checkedButton,
                              @IdRes int checkedId);
    }

    @Nullable
    private OnCheckedChangeListener listener;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public AutoFitGridRadioGroup(Context context) {
        super(context);
    }

    public AutoFitGridRadioGroup(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public AutoFitGridRadioGroup(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    // -----------------------------------------------------------------------
    // Initialisation
    // -----------------------------------------------------------------------

    private void init(Context context, AttributeSet attrs) {
        if (attrs == null) return;

        TypedArray a = context.obtainStyledAttributes(attrs, R.styleable.AutoFitGridRadioGroup);
        try {
            columnWidth = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridRadioGroup_column_width, 0);
            horizontalSpacing = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridRadioGroup_horizontal_spacing, 0);
            verticalSpacing = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridRadioGroup_vertical_spacing, 0);
        } finally {
            a.recycle();
        }
    }

    /**
     * Called after XML inflation. Wires up radio-selection listeners on every
     * direct {@link RadioButton} child, mirroring RadioGroup#onFinishInflate.
     */
    @Override
    protected void onFinishInflate() {
        super.onFinishInflate();
        wireChildren();
    }

    /**
     * Also wire up children added programmatically after inflation.
     */
    @Override
    public void addView(View child, int index, ViewGroup.LayoutParams params) {
        super.addView(child, index, params);
        if (child instanceof RadioButton) {
            wireRadioButton((RadioButton) child);
        }
    }

    // -----------------------------------------------------------------------
    // Radio wiring  (from RadioGroup)
    // -----------------------------------------------------------------------

    private void wireChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child instanceof RadioButton) {
                wireRadioButton((RadioButton) child);
            }
        }
    }

    private void wireRadioButton(RadioButton radio) {
        radio.setOnCheckedChangeListener((view, isChecked) -> {
            if (!isChecked) return;

            // Deselect the previously checked button
            if (checkedButton != null && checkedButton != view) {
                checkedButton.setChecked(false);
            }

            checkedButton = (RadioButton) view;

            if (listener != null) {
                listener.onCheckedChanged(this, checkedButton, checkedButton.getId());
            }
        });
    }

    // -----------------------------------------------------------------------
    // Measurement  (from AutoFitGridLayout)
    // -----------------------------------------------------------------------

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width          = MeasureSpec.getSize(widthMeasureSpec);
        int availableWidth = width - getPaddingLeft() - getPaddingRight();

        // Calculate column span count
        if (columnWidth > 0) {
            spanCount = Math.max(1,
                    (availableWidth + horizontalSpacing) / (columnWidth + horizontalSpacing));
        } else {
            spanCount = Math.max(1, spanCount); // keep whatever was set programmatically
        }

        int childWidth = (availableWidth - (spanCount - 1) * horizontalSpacing) / spanCount;

        int totalHeight = getPaddingTop() + getPaddingBottom();

        // Iterate row by row
        for (int i = 0; i < getChildCount(); i += spanCount) {
            int rowEnd    = Math.min(i + spanCount, getChildCount());
            int rowHeight = 0;

            // First pass: measure each child at its natural height
            for (int j = i; j < rowEnd; j++) {
                View child = getChildAt(j);
                if (child.getVisibility() == GONE) continue;

                int childWidthSpec  = MeasureSpec.makeMeasureSpec(childWidth, MeasureSpec.EXACTLY);
                int childHeightSpec = getChildMeasureSpec(
                        heightMeasureSpec, 0, child.getLayoutParams().height);

                child.measure(childWidthSpec, childHeightSpec);
                rowHeight = Math.max(rowHeight, child.getMeasuredHeight());
            }

            // Second pass: force uniform row height (mirrors AutoFitGridLayout)
            for (int j = i; j < rowEnd; j++) {
                View child = getChildAt(j);
                if (child.getVisibility() == GONE) continue;

                int exactWidthSpec  = MeasureSpec.makeMeasureSpec(childWidth, MeasureSpec.EXACTLY);
                int exactHeightSpec = MeasureSpec.makeMeasureSpec(rowHeight, MeasureSpec.EXACTLY);
                child.measure(exactWidthSpec, exactHeightSpec);
            }

            totalHeight += rowHeight;

            // Add vertical spacing only between rows
            if (i + spanCount < getChildCount()) {
                totalHeight += verticalSpacing;
            }
        }

        setMeasuredDimension(width, resolveSize(totalHeight, heightMeasureSpec));
    }

    // -----------------------------------------------------------------------
    // Layout  (from AutoFitGridLayout)
    // -----------------------------------------------------------------------

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int width          = getWidth();
        int availableWidth = width - getPaddingLeft() - getPaddingRight();
        int childWidth     = (availableWidth - (spanCount - 1) * horizontalSpacing) / spanCount;

        int x         = getPaddingLeft();
        int y         = getPaddingTop();
        int column    = 0;
        int rowHeight = 0;

        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child.getVisibility() == GONE) continue;

            int childHeight = child.getMeasuredHeight(); // already equalised in onMeasure

            child.layout(x, y, x + childWidth, y + childHeight);

            rowHeight = Math.max(rowHeight, childHeight);
            column++;

            if (column == spanCount) {
                // Start a new row
                column    = 0;
                x         = getPaddingLeft();
                y        += rowHeight + verticalSpacing;
                rowHeight = 0;
            } else {
                x += childWidth + horizontalSpacing;
            }
        }
    }

    // -----------------------------------------------------------------------
    // Public API — grid  (from AutoFitGridLayout)
    // -----------------------------------------------------------------------

    /** Sets the target column width in dp and triggers a re-layout. */
    public void setColumnWidthDp(int dp) {
        this.columnWidth = dpToPx(dp);
        requestLayout();
    }

    /** Sets a fixed span count instead of deriving it from columnWidth. */
    public void setSpanCount(int spanCount) {
        this.spanCount  = Math.max(1, spanCount);
        this.columnWidth = 0; // disable auto-fit so spanCount takes precedence
        requestLayout();
    }

    /** Sets horizontal and vertical spacing in dp and triggers a re-layout. */
    public void setSpacing(int horizontalDp, int verticalDp) {
        this.horizontalSpacing = dpToPx(horizontalDp);
        this.verticalSpacing   = dpToPx(verticalDp);
        requestLayout();
    }

    // -----------------------------------------------------------------------
    // Public API — radio  (from RadioGroup)
    // -----------------------------------------------------------------------

    /** Registers a callback to be invoked when the checked radio button changes. */
    public void setOnCheckedChangeListener(@Nullable OnCheckedChangeListener listener) {
        this.listener = listener;
    }

    /**
     * Returns the currently checked {@link RadioButton}, or {@code null} if none
     * is checked.
     */
    @Nullable
    public RadioButton getCheckedRadioButton() {
        return checkedButton;
    }

    /**
     * Returns the text of the currently checked button, or an empty string if
     * nothing is checked.
     */
    public String getCheckedRadioButtonText() {
        return checkedButton != null ? checkedButton.getText().toString() : "";
    }

    /**
     * Programmatically checks the button with the given view id, clearing any
     * previously checked button.
     */
    public void check(@IdRes int id) {
        View target = findViewById(id);
        if (target instanceof RadioButton) {
            ((RadioButton) target).setChecked(true);
        }
    }

    /** Clears the current selection without firing the listener. */
    public void clearCheck() {
        if (checkedButton != null) {
            checkedButton.setChecked(false);
            checkedButton = null;
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }
}