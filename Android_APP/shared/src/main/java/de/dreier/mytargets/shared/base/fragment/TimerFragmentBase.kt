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

package de.dreier.mytargets.shared.base.fragment

import android.app.Activity
import android.content.Context
import android.media.MediaPlayer
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Vibrator
import android.view.View
import android.view.WindowManager
import androidx.core.content.getSystemService
import androidx.fragment.app.Fragment
import de.dreier.mytargets.shared.R
import de.dreier.mytargets.shared.base.fragment.ETimerState.*
import de.dreier.mytargets.shared.models.TimerSettings
import de.dreier.mytargets.shared.utils.VibratorCompat

abstract class TimerFragmentBase : Fragment(), View.OnClickListener {

    private var currentStatus = WAIT_FOR_START
    private var countdown: CountDownTimer? = null
    private lateinit var horn: MediaPlayer
    lateinit var settings: TimerSettings
    private var exitAfterStop = true

    override fun onAttach(context: Context) {
        super.onAttach(context)
        horn = MediaPlayer.create(context, R.raw.horn)
    }

    @Suppress("OverridingDeprecatedMember", "DEPRECATION")
    override fun onAttach(activity: Activity?) {
        super.onAttach(activity)
        horn = MediaPlayer.create(activity, R.raw.horn)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        settings = arguments!!.getParcelable(ARG_TIMER_SETTINGS)!!
        exitAfterStop = arguments!!.getBoolean(ARG_EXIT_AFTER_STOP)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        activity!!.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.setOnClickListener(this)
        changeStatus(currentStatus)
    }

    override fun onDetach() {
        countdown?.cancel()
        if (horn.isPlaying) {
            horn.stop()
        }
        horn.release()
        super.onDetach()
    }

    override fun onClick(v: View) {
        changeStatus(currentStatus.next)
    }

    private fun changeStatus(status: ETimerState) {
        countdown?.cancel()
        if (status === ETimerState.EXIT) {
            if (exitAfterStop) {
                activity?.finish()
            } else {
                changeStatus(WAIT_FOR_START)
            }
            return
        }
        currentStatus = status
        applyStatus(status)
        playSignal(status.signalCount)

        if (status === FINISHED) {
            applyTime(getString(R.string.stop))
            countdown = object : CountDownTimer(6000, 100) {
                override fun onTick(millisUntilFinished: Long) {}

                override fun onFinish() {
                    changeStatus(status.next)
                }
            }.start()
        } else {
            if (status !== PREPARATION && status !== SHOOTING && status !== COUNTDOWN) {
                applyTime("")
            } else {
                val offset = getOffset(status)
                countdown = object : CountDownTimer((getDuration(status) * 1000).toLong(), 1000) {
                    override fun onTick(millisUntilFinished: Long) {
                        val countdown = offset + Math.ceil(millisUntilFinished / 1000.0).toInt()
                        applyTime(countdown.toString())
                    }

                    override fun onFinish() {
                        changeStatus(status.next)
                    }
                }.start()
            }
        }
    }

    protected fun getDuration(status: ETimerState): Int {
        return when (status) {
            PREPARATION -> settings.waitTime
            SHOOTING -> settings.shootTime - settings.warnTime
            COUNTDOWN -> settings.warnTime
            else -> throw IllegalArgumentException()
        }
    }

    private fun getOffset(status: ETimerState): Int {
        return if (status === SHOOTING) {
            settings.warnTime
        } else {
            0
        }
    }

    private fun playSignal(n: Int) {
        if (n > 0) {
            if (settings.sound) {
                playHorn(n)
            }
            if (settings.vibrate) {
                val pattern = LongArray(1 + n * 2)
                val v = activity!!.getSystemService<Vibrator>()!!
                pattern[0] = 150
                for (i in 0 until n) {
                    pattern[i * 2 + 1] = 400
                    pattern[i * 2 + 2] = 750
                }
                VibratorCompat.vibrate(v, pattern, -1)
            }
        }
    }

    private fun playHorn(n: Int) {
        if (!horn.isPlaying && !isDetached) {
            horn.start()
            horn.setOnCompletionListener {
                if (n > 1) {
                    playHorn(n - 1)
                }
            }
        }
    }

    abstract fun applyTime(text: String)

    protected abstract fun applyStatus(status: ETimerState)

    companion object {
        const val ARG_TIMER_SETTINGS = "timer_settings"
        const val ARG_EXIT_AFTER_STOP = "exit_after_stop"
    }

}
