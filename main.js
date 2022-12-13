import * as THREE from 'three';
import {Pane} from 'tweakpane';

import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

import * as Curves from 'three/examples/jsm/curves/CurveExtras.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

const splines = {
  GrannyKnot: new Curves.GrannyKnot(),
  HeartCurve: new Curves.HeartCurve( 3.5 ),
  VivianiCurve: new Curves.VivianiCurve( 70 ),
  KnotCurve: new Curves.KnotCurve(),
  HelixCurve: new Curves.HelixCurve(),
  TrefoilKnot: new Curves.TrefoilKnot(),
  TorusKnot: new Curves.TorusKnot( 20 ),
  CinquefoilKnot: new Curves.CinquefoilKnot( 20 ),
  TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot( 14 ),
  FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
  DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
  DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
  DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
  DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
};
const pipeSpline = new THREE.CatmullRomCurve3( [
  new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
  new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),
  new THREE.Vector3( 30, 0, 20 ), new THREE.Vector3( 20, 0, 30 ),
  new THREE.Vector3( 10, 0, 30 ), new THREE.Vector3( 0, 0, 30 ),
  new THREE.Vector3( - 10, 10, 30 ), new THREE.Vector3( - 10, 20, 30 ),
  new THREE.Vector3( 0, 30, 30 ), new THREE.Vector3( 10, 30, 30 ),
  new THREE.Vector3( 20, 30, 15 ), new THREE.Vector3( 10, 30, 10 ),
  new THREE.Vector3( 0, 30, 10 ), new THREE.Vector3( - 10, 20, 10 ),
  new THREE.Vector3( - 10, 10, 10 ), new THREE.Vector3( 0, 0, 10 ),
  new THREE.Vector3( 10, - 10, 10 ), new THREE.Vector3( 20, - 15, 10 ),
  new THREE.Vector3( 30, - 15, 10 ), new THREE.Vector3( 40, - 15, 10 ),
  new THREE.Vector3( 50, - 15, 10 ), new THREE.Vector3( 60, 0, 10 ),
  new THREE.Vector3( 70, 0, 0 ), new THREE.Vector3( 80, 0, 0 ),
  new THREE.Vector3( 90, 0, 0 ), new THREE.Vector3( 100, 0, 0 )
] );

export default class Sketch{
    constructor(){
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height );
        this.renderer.setClearColor(0x000,1)
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild( this.renderer.domElement );

        this.scene = new THREE.Scene();
        this.parent = new THREE.Object3D();
        this.scene.add(this.parent)

        this.camera = new THREE.PerspectiveCamera( 94, window.innerWidth / window.innerHeight, 0.01, 1000 );
        this.parent.add(this.camera)
        this.camera.position.set( 0, 50, 500 );
        
        // this.control = new OrbitControls(this.camera, this.renderer.domElement)
        // this.isometricFill();
        // this.camera.position.z = 2;

        
        
        this.time = 0;
        this.mouse = 0;
        this.position = new THREE.Vector3();
        this.binormal = new THREE.Vector3();
        this.normal = new THREE.Vector3();
			  this.direction = new THREE.Vector3();
			  this.lookAt = new THREE.Vector3();

        
        // this.camera = initFollowCamera(this.scene, 0);
        

        // this.initCamera();
        this.settings();
        this.addLight();
        this.addMesh();
        
        // this.mouseEvent();
        this.resize();
        // this.addPost();
        this.render();
        this.setupResize();

    }

    addLight(){
      // var light = new THREE.DirectionalLight(0xffffff);
      // light.position.set(0, 0, 1);
      // this.scene.add(light);
    
      // light = new THREE.DirectionalLight(0xffffff);
      // light.position.set(0, 0, -1);
      // this.scene.add(light);

      const light = new THREE.DirectionalLight( 0xffffff );
			light.position.set( 0, 0, 1 );
			this.scene.add( light );
    }

    isometricFill(){
        var frustumSize = 1;
        var aspect = this.width/this.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize / -2,
            frustumSize / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000 
        );
    }

    settings(){
        this.pane = new Pane();
        this.PARAMS = {
            progress: 0,
            scale: 10,
            offset: 6,
        };
        this.pane.addInput(
            this.PARAMS, 'progress',
            {min: 0, max: 1}
        ).on('change', (ev)=>{
            this.material.uniforms.uProgress.value = ev.value;
        })
        this.pane.addInput(
          this.PARAMS, 'scale',
          {min: 1, max: 20})
        this.pane.addInput(
          this.PARAMS, 'offset',
          {min: 1, max: 20})
    }

    mouseEvent(){
        document.addEventListener('mousemove', (e)=>{
            // mousemove
        })
    }

    addPost(){

    }

    addMesh(){

        this.geometry = new THREE.TubeGeometry(pipeSpline, 350, 2, 15, true);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouse: {value: 0},
                uResolution: {value: new THREE.Vector2()},
                uProgress: {value: 0},
                uImg: {value: this.texture},
                uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            side: THREE.DoubleSide,
            // transparent: true,
            wireframe: true,
        })

        this.material2 = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.scale.set(this.PARAMS.scale, this.PARAMS.scale, this.PARAMS.scale)
        
        this.parent.add(this.mesh)


        // this.geometry = new THREE.PlaneBufferGeometry(1,1);

        // this.material = new THREE.ShaderMaterial({
        //     vertexShader: vertex,
        //     fragmentShader: fragment,
            
        //     uniforms: {
        //         uMouse: {value: 0},
        //         uResolution: {value: new THREE.Vector2()},
        //         uProgress: {value: 0},
        //         uImg: {value: this.texture},
        //         uTime: {value: 0},
        //         // uSize: {value: 6.0},
        //         // uScale: {value: 0}
        //     },
        //     // side: THREE.DoubleSide,
        //     // transparent: true,
        //     // wireframe: true,
        // })
        
        // this.mesh = new THREE.Mesh( this.geometry, this.material );
        
        this.scene.add( this.parent );
    }

    setupResize(){
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        this.material.uniforms.uResolution.value.x = this.width;
        this.material.uniforms.uResolution.value.y = this.height;
    }

    render(){
        this.time++;
        const Dtime = Date.now();

        const looptime = 20 * 1000;
				const t = ( Dtime % looptime ) / looptime;

        this.geometry.parameters.path.getPointAt(t, this.position);
        this.position.multiplyScalar( this.PARAMS.scale );

        // interpolation

        const segments = this.geometry.tangents.length;
        const pickt = t * segments;
        const pick = Math.floor( pickt );
        const pickNext = ( pick + 1 ) % segments;

        this.binormal.subVectors( this.geometry.binormals[ pickNext ], this.geometry.binormals[ pick ] );
        this.binormal.multiplyScalar( pickt - pick ).add( this.geometry.binormals[ pick ] );

        this.geometry.parameters.path.getTangentAt( t, this.direction );

        this.normal.copy( this.binormal ).cross( this.direction );

        // we move on a offset on its binormal

        this.position.add( this.normal.clone().multiplyScalar( this.PARAMS.offset ) );

        this.camera.position.copy( this.position );

        // using arclength for stablization in look ahead

        this.geometry.parameters.path.getPointAt( ( t + 30 / this.geometry.parameters.path.getLength() ) % 1, this.lookAt );
        this.lookAt.multiplyScalar( this.PARAMS.scale );

        // camera orientation 2 - up orientation via normal
        this.camera.matrix.lookAt( this.camera.position, this.lookAt, this.normal );
        this.camera.quaternion.setFromRotationMatrix( this.camera.matrix );




        
        // this.scene.rotation.x = this.time / 2000;
	    // this.scene.rotation.y = this.time / 1000;
        this.material.uniforms.uTime.value = this.time;


        // this.control.update();
        this.renderer.render( this.scene, this.camera );
        
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();