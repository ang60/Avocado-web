package com.avocado.android.ui.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.R;

public class AutoFitGridLayout extends ViewGroup {

    private int columnWidth; // in px
    private int horizontalSpacing = 0;
    private int verticalSpacing = 0;

    private int spanCount = 1;

    public AutoFitGridLayout(Context context) {
        super(context);
    }

    public AutoFitGridLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public AutoFitGridLayout(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    private void init(Context context, AttributeSet attrs) {
        if (attrs != null) {
            TypedArray a = context.obtainStyledAttributes(attrs, R.styleable.AutoFitGridLayout);

            columnWidth = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridLayout_column_width, -1);

            horizontalSpacing = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridLayout_horizontal_spacing, 0);

            verticalSpacing = a.getDimensionPixelSize(
                    R.styleable.AutoFitGridLayout_vertical_spacing, 0);

            a.recycle();
        }
    }

    // Measure children and calculate grid
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {

        int width = MeasureSpec.getSize(widthMeasureSpec);
        int availableWidth = width - getPaddingLeft() - getPaddingRight();

        if (columnWidth > 0) {
            spanCount = Math.max(1,
                    (availableWidth + horizontalSpacing) / (columnWidth + horizontalSpacing));
        }

        int childWidth = (availableWidth - (spanCount - 1) * horizontalSpacing) / spanCount;

        int totalHeight = getPaddingTop() + getPaddingBottom();

        for (int i = 0; i < getChildCount(); i += spanCount) {

            int rowEnd = Math.min(i + spanCount, getChildCount());
            int rowHeight = 0;

            // First pass: measure normally
            for (int j = i; j < rowEnd; j++) {
                View child = getChildAt(j);
                if (child.getVisibility() == GONE) continue;

                LayoutParams lp = child.getLayoutParams();

                int childWidthSpec = MeasureSpec.makeMeasureSpec(childWidth, MeasureSpec.EXACTLY);
                int childHeightSpec = getChildMeasureSpec(heightMeasureSpec, 0, lp.height);

                child.measure(childWidthSpec, childHeightSpec);

                rowHeight = Math.max(rowHeight, child.getMeasuredHeight());
            }

            // Second pass: FORCE same height
            for (int j = i; j < rowEnd; j++) {
                View child = getChildAt(j);
                if (child.getVisibility() == GONE) continue;

                int exactHeightSpec = MeasureSpec.makeMeasureSpec(rowHeight, MeasureSpec.EXACTLY);
                int exactWidthSpec = MeasureSpec.makeMeasureSpec(childWidth, MeasureSpec.EXACTLY);

                child.measure(exactWidthSpec, exactHeightSpec);
            }

            totalHeight += rowHeight;

            if (i + spanCount < getChildCount()) {
                totalHeight += verticalSpacing;
            }
        }

        setMeasuredDimension(width, resolveSize(totalHeight, heightMeasureSpec));
    }

    // Position children
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {

        int width = getWidth();
        int availableWidth = width - getPaddingLeft() - getPaddingRight();

        int childWidth = (availableWidth - (spanCount - 1) * horizontalSpacing) / spanCount;

        int x = getPaddingLeft();
        int y = getPaddingTop();

        int column = 0;
        int rowHeight = 0;

        for (int i = 0; i < getChildCount(); i++) {

            View child = getChildAt(i);
            if (child.getVisibility() == GONE) continue;

            int childHeight = child.getMeasuredHeight(); // already equalized

            child.layout(x, y, x + childWidth, y + childHeight);

            rowHeight = Math.max(rowHeight, childHeight);

            column++;

            if (column == spanCount) {
                column = 0;
                x = getPaddingLeft();
                y += rowHeight + verticalSpacing;
                rowHeight = 0;
            } else {
                x += childWidth + horizontalSpacing;
            }
        }
    }

    // Public setters
    public void setColumnWidthDp(int dp) {
        this.columnWidth = dpToPx(dp);
        requestLayout();
    }

    public void setSpacing(int horizontalDp, int verticalDp) {
        this.horizontalSpacing = dpToPx(horizontalDp);
        this.verticalSpacing = dpToPx(verticalDp);
        requestLayout();
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }
}
