package com.courierreactnative

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import com.courier.android.inbox.CourierInbox

class ReactNativeCourierInbox @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0) : FrameLayout(context, attrs, defStyleAttr) {

  var inbox: CourierInbox

  init {

    // Create an instance of CourierInbox
    inbox = CourierInbox(context, attrs, defStyleAttr)

    // Set layout parameters to fill parent
    val layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )

    // Apply the layout parameters
    inbox.layoutParams = layoutParams

    // Add it as a child of this custom view
    addView(inbox)

  }

//  private var mRequestedLayout = false
//
//  @SuppressLint("WrongCall")
//  override fun requestLayout() {
//    super.requestLayout()
//    // We need to intercept this method because if we don't our children will never update
//    // Check https://stackoverflow.com/questions/49371866/recyclerview-wont-update-child-until-i-scroll
//    if (!mRequestedLayout) {
//      mRequestedLayout = true
//      post {
//        mRequestedLayout = false
//        layout(left, top, right, bottom)
//        onLayout(false, left, top, right, bottom)
//      }
//    }
//  }

}
