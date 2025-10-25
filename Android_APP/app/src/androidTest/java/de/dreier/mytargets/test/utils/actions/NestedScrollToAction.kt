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

package de.dreier.mytargets.test.utils.actions

import android.graphics.Rect
import androidx.test.espresso.PerformException
import androidx.test.espresso.UiController
import androidx.test.espresso.ViewAction
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.espresso.matcher.ViewMatchers.isDisplayingAtLeast
import androidx.test.espresso.util.HumanReadables
import androidx.core.widget.NestedScrollView
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import org.hamcrest.CoreMatchers
import org.hamcrest.Matcher
import timber.log.Timber

/**
 * Enables scrolling to the given view. View must be a descendant of a ScrollView.
 */
class NestedScrollToAction : ViewAction {

    override fun getConstraints(): Matcher<View> {
        return CoreMatchers
                .allOf(ViewMatchers.withEffectiveVisibility(ViewMatchers.Visibility.VISIBLE),
                        ViewMatchers.isDescendantOfA(CoreMatchers.anyOf(
                                ViewMatchers.isAssignableFrom(ScrollView::class.java),
                                ViewMatchers.isAssignableFrom(HorizontalScrollView::class.java),
                                ViewMatchers.isAssignableFrom(NestedScrollView::class.java))))
    }

    override fun perform(uiController: UiController, view: View) {
        if (isDisplayingAtLeast(90).matches(view)) {
            Timber.i("View is already displayed. Returning.")
            return
        }
        val rect = Rect()
        view.getDrawingRect(rect)
        if (!/* immediate */view.requestRectangleOnScreen(rect, true)) {
            Timber.w("Scrolling to view was requested, but none of the parents scrolled.")
        }
        uiController.loopMainThreadUntilIdle()
        if (!isDisplayingAtLeast(90).matches(view)) {
            throw PerformException.Builder()
                    .withActionDescription(this.description)
                    .withViewDescription(HumanReadables.describe(view))
                    .withCause(RuntimeException(
                            "Scrolling to view was attempted, but the view is not displayed"))
                    .build()
        }
    }

    override fun getDescription(): String {
        return "scroll to"
    }
}
