from django.conf.urls import url, include
from django.contrib import admin

from annotator.views import *

urlpatterns = [
    url(r'^$', home),
    url(r'^video/(\w+)', video),
    url(r'^annotation/(\w+)', AnnotationView.as_view()),

    url(r'^admin/', admin.site.urls),
]
