/*
 * Copyright (C) 2018 Florian Dreier
 *
 * This file is part of MyTargets.
 *
 * MyTargets is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * MyTargets is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

package de.dreier.mytargets.views.speeddial

import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.interpolator.view.animation.FastOutSlowInInterpolator
import android.view.View
import android.view.ViewPropertyAnimator
import com.google.android.material.snackbar.Snackbar

object FabSpeedDialBehaviour : CoordinatorLayout.Behavior<FabSpeedDial>() {

    private val FAST_OUT_SLOW_IN_INTERPOLATOR = FastOutSlowInInterpolator()

    private var fabTranslationYAnimator: ViewPropertyAnimator? = null
    private var fabTranslationY: Float = 0.toFloat()

    override fun layoutDependsOn(
        parent: CoordinatorLayout,
        child: FabSpeedDial,
        dependency: View
    ): Boolean {
        return dependency is Snackbar.SnackbarLayout
    }

    override fun onDependentViewRemoved(
        parent: CoordinatorLayout,
        child: FabSpeedDial,
        dependency: View
    ) {
        super.onDependentViewRemoved(parent, child, dependency)

        // Make sure that any current animation is cancelled
        if (fabTranslationYAnimator != null) {
            fabTranslationYAnimator!!.cancel()
        }

        child.translationY = 0f
        fabTranslationY = 0f
    }

    override fun onDependentViewChanged(
        parent: CoordinatorLayout,
        child: FabSpeedDial,
        dependency: View
    ): Boolean {
        if (dependency is Snackbar.SnackbarLayout) {
            updateFabTranslationForSnackbar(parent, child)
        }
        return false
    }

    private fun updateFabTranslationForSnackbar(parent: CoordinatorLayout, fab: FabSpeedDial) {
        if (fab.visibility != View.VISIBLE) {
            return
        }

        val targetTransY = getFabTranslationYForSnackbar(parent, fab)
        if (fabTranslationY == targetTransY) {
            // We're already at (or currently animating to) the target value, return...
            return
        }

        val currentTransY = fab.translationY

        // Make sure that any current animation is cancelled
        fabTranslationYAnimator?.cancel()

        if (Math.abs(currentTransY - targetTransY) > fab.height * 0.667f) {
            fabTranslationYAnimator = fab.animate()
                .setInterpolator(FAST_OUT_SLOW_IN_INTERPOLATOR)
                .translationY(targetTransY)
            fabTranslationYAnimator!!.start()
        } else {
            fab.translationY = targetTransY
        }

        fabTranslationY = targetTransY
    }

    private fun getFabTranslationYForSnackbar(parent: CoordinatorLayout, fab: FabSpeedDial): Float {
        var minOffset = 0f
        val dependencies = parent.getDependencies(fab)
        for (i in dependencies.indices) {
            val view = dependencies[i]
            if (view is Snackbar.SnackbarLayout && parent.doViewsOverlap(fab, view)) {
                minOffset = Math.min(
                    minOffset,
                    view.getTranslationY() - view.getHeight()
                )
            }
        }
        return minOffset
    }
}
