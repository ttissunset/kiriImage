import GalleryView from '../views/GalleryView.vue'
import FavoriteView from '../views/FavoriteView.vue'
import ImagePreview from '../components/ImagePreview.vue'
import UploadView from '../views/UploadView.vue'

const routes = [
  {
    path: '/',
    name: 'gallery',
    component: GalleryView
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoriteView
  },
  {
    path: '/preview/:id',
    name: 'preview',
    component: ImagePreview,
    props: true
  },
  {
    path: '/upload',
    name: 'upload',
    component: UploadView
  }
]

export default routes 