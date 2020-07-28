import './styles.scss'

/**
 * Splash loader that shows between routes during authentication
 * (stylized as a spinning wheel)
 */
export default class SplashLoader {
  view (vnode) {
    return (
      <div class="holder">
        <div class="preloader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }
}
