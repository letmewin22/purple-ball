var container,
    renderer,
    scene,
    camera,
    mesh,
    fov = 45;
var start = Date.now();

window.addEventListener('load', init);



function init() {
    container = document.getElementById('container');

    scene = new THREE.Scene();
    scene.destination = { x: 0, y: 0 };

    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.z = 70;
    camera.target = new THREE.Vector3(0, 0, 0);

    scene.add(camera);



    var panoTexture = new THREE.TextureLoader().load(
        'img/generated-in-11.png'
    );

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(200, 60, 60),
        new THREE.MeshBasicMaterial({ map: panoTexture })
    );
    sphere.scale.x = -1;
    sphere.doubleSided = true;
    scene.add(sphere);

    material = new THREE.ShaderMaterial({
        uniforms: {
            tShine: { type: 't', value: panoTexture },
            time: { type: 'f', value: 0 },
            weight: { type: 'f', value: 0 },
        },
        vertexShader: ` //
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float stripes( float x, float f) {
  float PI = 3.14159265358979323846264;
  float t = .5 + .5 * cos( f * 2.0 * PI * x);
  return t * t - .5;
}

float turbulence( vec3 p ) {
  float w = 100.0;
  float t = -.5;
  for (float f = 1.0 ; f <= 10.0 ; f++ ){
    float power = pow( 2.0, f );
    t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
  }
  return t;
}

float f( vec3 p ) {
  return pnoise( vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
  return pnoise( 8.0 * vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
}

varying vec3 vNormal;
varying vec3 vReflect;
varying float ao;
uniform float time;
float weight = 0.2;

float fround( float value ) {
  return floor( value + 0.5 );
}

vec3 v3round( vec3 value ) {
  return vec3( fround( value.x ), fround( value.y ), fround( value.z ) );
}

void main() {

  vec3 evNormal = normal;
  vec3 aniNormal = 2.0 * evNormal * cos(time) * 5.0 + 2.0;
  float f0 = weight * f( aniNormal );
  float fx = weight * f( aniNormal + vec3( .0001, 0.0, 0.0 ) );
  float fy = weight * f( aniNormal + vec3( 0.0, .0001, 0.0 ) );
  float fz = weight * f( aniNormal + vec3( 0.0, 0.0, .0001 ) );
  vec3 modifiedNormal = normalize( evNormal - vec3( (fx - f0) / .0001, (fy - f0) / .0001, (fz - f0) / .0001 ) );

  if( weight > 0.0 ) {
    ao = f0 / weight;
  } 
  vNormal = modifiedNormal;
  vec3 newPosition = position + f0 * evNormal;
  vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * modifiedNormal );
  vReflect = normalize( reflect( normalize( newPosition.xyz - cameraPosition ), nWorld ) );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}`,
        fragmentShader: `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vReflect;
varying float ao;
uniform sampler2D tShine;
uniform float time;

float PI = 3.14159265358979323846264;

float blendLighten(float base, float blend) {
  return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
  return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
  return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}

float blendDarken(float base, float blend) {
  return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
  return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
  return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}

void main() {

  float yaw = .5 - atan( vReflect.z, - vReflect.x ) / ( 2.0 * PI );
  float pitch = .5 - asin( vReflect.y ) / PI;
  vec2 pos = vec2( yaw, pitch );

  vec3 color = normalize(vec3(vNormal.x, 0.0, 0.9));
    vec3 textureColor = texture2D( tShine, pos ).rgb;
    color = blendLighten(color, textureColor, 1.0);
    color = blendDarken(color, textureColor, 0.3);

  float diffuse_value1 = .0015 * max(dot(vNormal, vec3( -490.0, 29.8, -85.8 ) ), 0.0);
  float diffuse_value2 = .0015 * max(dot(vNormal, vec3( -460.0, 40.27, 187.4 ) ), 0.0);
  float diffuse_value3 = .0005 * max(dot(vNormal, vec3( 175.5, 30.04, 466.4 ) ), 0.0);
  float diffuse_value4 = .0005 * max(dot(vNormal, vec3( 466.0, 45.3, 172.9 ) ), 0.0);

  gl_FragColor = vec4( color - .15 * ao + .5 * vec3( diffuse_value1 + diffuse_value2 + diffuse_value3 + diffuse_value4 ), 1.0 );

}`,
    });

    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 5), material);
    mesh.rotation.z = 120;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

    // var controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableKeys = false;
    // controls.enableZoom = false;

    window.addEventListener('resize', onWindowResize, false);


    render();
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


start = Date.now();

function render() {
    if (screen.width > 1024) {
        scene.rotation.x = 0.001 * (start - Date.now());
        material.uniforms.time.value = 0.000001 * (start - Date.now());
    } else {
        material.uniforms.time.value = 0.0001 * (start - Date.now());
        scene.rotation.x = 0.001 * (start - Date.now());

    }

    scene.rotation.x += (scene.destination.x - scene.rotation.x) * 0.05;
    scene.rotation.y += (scene.destination.y - scene.rotation.y) * 0.05;


    renderer.render(scene, camera);
    requestAnimationFrame(render);

    // if (screen.width > 1024) {
    //     let ww = window.innerWidth;
    //     let wh = window.innerHeight;

    //     function onMousemove(e) {
    //         var x = (e.clientX - ww / 2) / (ww / 2);
    //         var y = (e.clientY - wh / 2) / (wh / 2);
    //         scene.destination.x = y * 1.5;
    //         scene.destination.y = x * 1.5;


    //     }

    //     document.querySelector('#container').addEventListener('mousemove', onMousemove);

    // }
}



document.body.imagesLoaded().done( function() {
    let cont = document.querySelector('#container');
    let h1 = document.querySelector('h1');
    let dragAndDropWrapper = document.querySelector('.drag-and-drop');
    let loader = document.querySelector('.loader');
    let triger = [...document.querySelectorAll('.triger')];
    let Bgg = document.querySelector('.bg');

    let arrDrag = [document.querySelector('.dots'), document.querySelector('.option'), document.querySelector('.radar'), document.querySelector('.drag-to')]
    if (screen.width > 1024) {

        let tl = new TimelineMax({onComplete: function () {
          document.querySelector('.loader').style.display = 'none';
          document.querySelector('.radar').style.display = 'block';
        }});
        tl
            .delay(1)
            .to(triger[0], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[0], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(document.querySelector('.loader').style, 0.01, { backgroundColor: 'transparent', ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 2, { scale: 0.01, ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 0.5, { opacity: 0 })
            .to(document.querySelector('.loader-circle').style, 2, { backgroundColor: '#A03ADB'}, 2.4)
            .fromTo(cont, 2, { y: "100%", alpha: 0 }, { y: "0%", alpha: 1, ease: Power3.easeInOut }, 2.7)
            .fromTo(cont, 2, { x: "0%" }, { x: "25%", ease: Power3.easeInOut }, 3.7)
            .fromTo(h1, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 4.1)
            .fromTo(arrDrag, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 4.1)

    } 
    else if (screen.width > 460) {
                let tl4 = new TimelineMax({onComplete: function () {
          document.querySelector('.loader').style.display = 'none';
          document.querySelector('.radar').style.display = 'block';
        }});
        tl4
            .delay(1)
            .to(triger[0], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[0], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(document.querySelector('.loader').style, 0.01, { backgroundColor: 'transparent', ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 1.5, { scale: 0.01, ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 0.5, { opacity: 0, ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle').style, 2, { backgroundColor: '#A03ADB'}, 2.4)
            .fromTo(cont, 2, { y: "-90%", alpha: 0 }, { y: "0%", alpha: 1, ease: Power3.easeInOut }, 2.7)
            .fromTo(h1, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 3.1)
            .fromTo(arrDrag, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 3.1)
            .to(Bgg, 0.3, { opacity: 1, ease: Power3.easeInOut }, 3.2)
    } else {

                let tl = new TimelineMax({onComplete: function () {
          document.querySelector('.loader').style.display = 'none';
          document.querySelector('.radar').style.display = 'block';
        }});
        tl
            .delay(1)
            .to(triger[0], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[0], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[1], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 1, ease: Power3.easeInOut })
            .to(triger[2], 0.3, { opacity: 0, ease: Power3.easeInOut })
            .to(document.querySelector('.loader').style, 0.01, { backgroundColor: 'transparent', ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 1.5, { scale: 0.01, ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle'), 0.5, { opacity: 0, ease: Power3.easeInOut })
            .to(document.querySelector('.loader-circle').style, 2, { backgroundColor: '#A03ADB'}, 2.4)
            .fromTo(cont, 2, { y: "-90%", alpha: 0 }, { y: "-10%", alpha: 1, ease: Power3.easeInOut }, 2.7)
            .fromTo(h1, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 3.1)
            .fromTo(arrDrag, 2, { alpha: 0 }, { alpha: 1, ease: Power3.easeInOut }, 3.1)
            .to(Bgg, 0.3, { opacity: 1, ease: Power3.easeInOut }, 3.2)



    }


}());

  
