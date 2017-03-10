/**
 * Created by bfs on 2017-03-09.
 */

/**
 * @author whychible@gmail.com
 * @type {{data, list, create}}
 */
var daumMaps = (function () {
    "use strict";

    var
        list = [], //API 객체 리스트
        data = null, //마지막 API 객체를 캐싱한다.
        create
        ;

    /**
     * API 객체를 생성한다.
     * @param mapDivId
     * @param mapOption
     * @returns {{mapDivId, mapContainer, map, markers, lastMarker, ps, searchPlaces, addMarker, addSpriteImageMarker, addImageMarker, removeAllMarker, setCenter, panTo, setBounds, resizeMap, drawLine, bindCustomOverlayToMarker}}
     */
    create = function (mapDivId, mapOption) {
        var result = (function () {
            var
                divId = mapDivId,
                mapContainer = document.getElementById(mapDivId),
                map = new daum.maps.Map(mapContainer, mapOption),
                markers = [],
                lastMarker = null,
                ps = new daum.maps.services.Places(), //키워드로 장소 검색 서비스 객체
                geocoder = new daum.maps.services.Geocoder(), // 주소-좌표 변환 객체
                searchPlacesFromKeyword,
                addMarker,
                addSpriteImageMarker,
                addImageMarker,
                removeAllMarker,
                setCenter,
                panTo,
                setBounds,
                resizeMap,
                drawLine,
                bindCustomOverlayToMarker
                ;

            /**
             * 키워드로 장소 검색
             * 장소 검색 후 페이징 객체가 파라미터로 전달된다.
             * 페이징 객체는 다음 API에서 제공된 기능이며 페이지 이동 시 callbackPlacesSearch 함수가 호출된다.
             *
             * 참고:
             * 키워드 검색 : http://apis.map.daum.net/web/documentation/#services_Places
             * 페이징 : http://apis.map.daum.net/web/documentation/#Pagination
             *
             * ps : `callbackPlacesSearch 함수는 개발마다 변경사항이 많으므로 다음 API 모듈에 추가하지 않았다.`
             *
             * @param keyword
             * @param callbackPlacesSearch
             * @returns {boolean}
             */
            searchPlacesFromKeyword = function (keyword, callbackPlacesSearch) {

                if (!keyword.replace(/^\s+|\s+$/g, '')) {
                    alert('키워드를 입력해주세요.');
                    return false;
                }

                // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
                if (typeof callbackPlacesSearch === 'function') {
                    ps.keywordSearch(keyword, callbackPlacesSearch);
                } else {
                    alert('To 개발자 : callback function을 추가하소.');
                    return false;
                }

            };

            /**
             * 마커를 생성하고 지도 위에 마커를 표시한다.
             * @param latLng
             * @returns {daum.maps.Marker}
             */
            addMarker = function (latLng) {

                var marker = new daum.maps.Marker({
                    position: latLng // 마커의 위치
                });

                marker.setMap(map); // 지도 위에 마커를 표출합니다
                markers.push(marker);  // 배열에 생성된 마커를 추가합니다
                lastMarker = marker;
                return marker;
            };

            /**
             * 스프라이트 이미지 마커를 생성한다.
             * @param latLng
             * @param idx
             * @param pImageSrc
             * @param pImageSize
             * @param pImageOptions
             * @returns {daum.maps.Marker}
             */
            addSpriteImageMarker = function (latLng, idx, pImageSrc, pImageSize, pImageOptions) {

                var imageSrc = pImageSrc || 'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
                    imageSize = pImageSize || new daum.maps.Size(36, 37),  // 마커 이미지의 크기
                    imgOptions = pImageOptions || {
                            spriteSize: new daum.maps.Size(36, 691), // 스프라이트 이미지의 크기
                            spriteOrigin: new daum.maps.Point(0, ((idx || 1) * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
                            offset: new daum.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
                        },
                    markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imgOptions),
                    marker = new daum.maps.Marker({
                        position: latLng, // 마커의 위치
                        image: markerImage
                    });

                marker.setMap(map); // 지도 위에 마커를 표출합니다
                markers.push(marker);  // 배열에 생성된 마커를 추가합니다
                lastMarker = marker;
                return marker;
            };

            /**
             * 이미지 마커를 생성한다.
             * @param latLng
             * @param pImageSrc
             * @param pImageSize
             * @param pImageOptions
             * @returns {daum.maps.Marker}
             */
            addImageMarker = function (latLng, pImageSrc, pImageSize, pImageOptions) {

                var imageSrc = pImageSrc || 'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 마커이미지의 주소입니다
                    imageSize = pImageSize || new daum.maps.Size(64, 69), // 마커이미지의 크기입니다
                    imageOption = pImageOptions || {offset: new daum.maps.Point(27, 69)}, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
                    markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
                    marker = new daum.maps.Marker({
                        position: latLng, // 마커의 위치
                        image: markerImage
                    });

                marker.setMap(map); // 지도 위에 마커를 표출합니다
                markers.push(marker);  // 배열에 생성된 마커를 추가합니다
                lastMarker = marker;
                return marker;
            };

            /**
             * 지도 위에 표시되고 있는 마커를 모두 제거한다.
             */
            removeAllMarker = function () {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers = [];
            };

            /**
             * 지도 중심으로 이동시킨다.
             * @param lat
             * @param lng
             */
            setCenter = function (lat, lng) {
                // 이동할 위도 경도 위치를 생성합니다
                var moveLatLon = new daum.maps.LatLng(lat, lng);
                // 지도 중심을 이동 시킵니다
                map.setCenter(moveLatLon);
            };

            /**
             * 지도 중심으로 부드럽게 이동시킨다.
             * @param lat
             * @param lng
             */
            panTo = function (lat, lng) {
                // 이동할 위도 경도 위치를 생성합니다
                var moveLatLon = new daum.maps.LatLng(lat, lng);
                // 지도 중심을 부드럽게 이동시킵니다
                // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
                map.panTo(moveLatLon);
            };

            /**
             * 지도 중심좌표를 재설정한다.
             * @param bounds
             */
            setBounds = function (bounds) {
                // LatLngBounds : 지도를 재설정할 범위정보를 가지고 있을 객체
                // LatLngBounds 객체에 추가된 좌표들을 기준으로 지도의 범위를 재설정합니다
                // 이때 지도의 중심좌표와 레벨이 변경될 수 있습니다
                map.setBounds(bounds);
            };

            /**
             * 지도를 표시하는 div 크기를 변경한다.
             * @param width
             * @param height
             */
            resizeMap = function (width, height) {
                mapContainer.style.width = width + 'px';
                mapContainer.style.height = height + 'px';
                map.relayout();

                function relayout() {

                    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
                    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다
                    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
                    map.relayout();
                };
            };

            /**
             * 선 그리기
             * @param latLngArray 선을 구성하는 좌표 배열입니다. 이 좌표들을 이어서 선을 표시합니다
             */
            drawLine = function (latLngArray) {

                // 지도에 표시할 선을 생성합니다
                var polyline = new daum.maps.Polyline({
                    path: latLngArray, // 선을 구성하는 좌표배열 입니다
                    strokeWeight: 5, // 선의 두께 입니다
                    strokeColor: '#FFAE00', // 선의 색깔입니다
                    strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                    strokeStyle: 'solid' // 선의 스타일입니다
                });

                // 지도에 선을 표시합니다
                polyline.setMap(map);
            };

            /**
             * 커스텀 오버레이 (마커-모달창)
             * @param content
             * @param closeClassName 오버레이 HTML 내 닫기 버튼의 class 명
             * @param marker
             */
            bindCustomOverlayToMarker = function (content, closeClassName, marker) {
                // 커스텀 오버레이에 표시할 컨텐츠 입니다
                // 커스텀 오버레이는 아래와 같이 사용자가 자유롭게 컨텐츠를 구성하고 이벤트를 제어할 수 있기 때문에
                // 별도의 이벤트 메소드를 제공하지 않습니다
                var $content = $(content);
                $content.find(closeClassName).attr('onclick', 'closeOverlay()');

                // 마커 위에 커스텀오버레이를 표시합니다
                // 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
                var overlay = new daum.maps.CustomOverlay({
                    content: $content.html(),
                    map: map,
                    position: marker.getPosition()
                });

                // 마커를 클릭했을 때 커스텀 오버레이를 표시합니다
                daum.maps.event.addListener(marker, 'click', function () {
                    overlay.setMap(map);
                });

                // 커스텀 오버레이를 닫기 위해 호출되는 함수입니다
                function closeOverlay() {
                    overlay.setMap(null);
                }
            };

            return {
                mapDivId: divId,
                mapContainer: mapContainer,
                map: map,
                markers: markers,
                lastMarker: lastMarker,
                ps: ps,
                searchPlacesFromKeyword: searchPlacesFromKeyword,
                addMarker: addMarker,
                addSpriteImageMarker: addSpriteImageMarker,
                addImageMarker: addImageMarker,
                removeAllMarker: removeAllMarker,
                setCenter: setCenter,
                panTo: panTo,
                setBounds: setBounds,
                resizeMap: resizeMap,
                drawLine: drawLine,
                bindCustomOverlayToMarker: bindCustomOverlayToMarker
            }
        }());

        list.push(result);
        data = result;
        return result;
    };

    return {
        data: data,
        list: list,
        create: create
    }

}());
