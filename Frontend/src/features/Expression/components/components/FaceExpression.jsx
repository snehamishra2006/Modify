import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const FaceExpression = () => {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("Click Start");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // ==========================================
  // INITIALIZE MEDIAPIPE
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const initializeFaceLandmarker = async () => {
      try {
        const vision =
          await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );

        const faceLandmarker =
          await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              },

              runningMode: "VIDEO",

              numFaces: 1,

              outputFaceBlendshapes: true,

              minFaceDetectionConfidence: 0.5,

              minFacePresenceConfidence: 0.5,

              minTrackingConfidence: 0.5,
            }
          );

        if (!mounted) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current =
          faceLandmarker;

        console.log("MediaPipe initialized");
      } catch (err) {
        console.error(
          "MediaPipe initialization error:",
          err
        );

        setError(
          "Unable to initialize face detection."
        );
      }
    };

    initializeFaceLandmarker();

    return () => {
      mounted = false;

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  // ==========================================
  // START CAMERA
  // ==========================================

  const handleStart = async () => {
    if (!faceLandmarkerRef.current) {
      setError(
        "Face detector is still loading. Please wait..."
      );

      return;
    }

    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },
            audio: false,
          }
        );

      streamRef.current = stream;

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata =
        async () => {
          try {
            await videoRef.current.play();

            setIsStarted(true);

            detectFace();
          } catch (err) {
            console.error(
              "Video play error:",
              err
            );
          }
        };
    } catch (err) {
      console.error(
        "Camera error:",
        err
      );

      setError(
        "Camera permission denied. Please allow camera access."
      );
    }
  };

  // ==========================================
  // GET BLENDSHAPE SCORE
  // ==========================================

  const getScore = (
    blendshapes,
    name
  ) => {
    const shape = blendshapes.find(
      (item) =>
        item.categoryName === name
    );

    return shape
      ? shape.score
      : 0;
  };

  // ==========================================
  // DETECT FACE
  // ==========================================

  const detectFace = () => {
    if (
      !videoRef.current ||
      !faceLandmarkerRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (video.readyState >= 2) {
      try {
        const result =
          faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

        if (
          result.faceBlendshapes &&
          result.faceBlendshapes.length > 0
        ) {
          const blendshapes =
            result.faceBlendshapes[0]
              .categories;

          const detected =
            detectExpression(
              blendshapes
            );

          setExpression(
            detected.expression
          );

          setConfidence(
            Math.round(
              detected.confidence * 100
            )
          );
        } else {
          setExpression("😐 No Face");
          setConfidence(0);
        }
      } catch (err) {
        console.error(
          "Detection error:",
          err
        );
      }
    }

    animationRef.current =
      requestAnimationFrame(
        detectFace
      );
  };

  // ==========================================
  // EXPRESSION DETECTION
  // ==========================================

  const detectExpression = (
    blendshapes
  ) => {
    // ========================================
    // 😊 HAPPY
    // ========================================

    const smileLeft =
      getScore(
        blendshapes,
        "mouthSmileLeft"
      );

    const smileRight =
      getScore(
        blendshapes,
        "mouthSmileRight"
      );

    const smile =
      (smileLeft +
        smileRight) /
      2;

    // ========================================
    // 😮 SURPRISED
    // ========================================

    const jawOpen =
      getScore(
        blendshapes,
        "jawOpen"
      );

    const browInnerUp =
      getScore(
        blendshapes,
        "browInnerUp"
      );

    // ========================================
    // 😠 ANGRY
    // ========================================

    const browDownLeft =
      getScore(
        blendshapes,
        "browDownLeft"
      );

    const browDownRight =
      getScore(
        blendshapes,
        "browDownRight"
      );

    const browDown =
      (browDownLeft +
        browDownRight) /
      2;

    const eyeSquintLeft =
      getScore(
        blendshapes,
        "eyeSquintLeft"
      );

    const eyeSquintRight =
      getScore(
        blendshapes,
        "eyeSquintRight"
      );

    const eyeSquint =
      (eyeSquintLeft +
        eyeSquintRight) /
      2;

    // ========================================
    // 😮 SURPRISED
    // ========================================

    if (
      jawOpen > 0.3 &&
      browInnerUp > 0.2
    ) {
      return {
        expression:
          "😮 Surprised",

        confidence:
          Math.min(
            (jawOpen +
              browInnerUp) /
              2,
            1
          ),
      };
    }

    // Mouth wide open
    if (jawOpen > 0.55) {
      return {
        expression:
          "😮 Surprised",

        confidence:
          Math.min(
            jawOpen,
            1
          ),
      };
    }

    // ========================================
    // 😠 ANGRY
    // ========================================

    if (
      browDown > 0.3 &&
      eyeSquint > 0.1 &&
      smile < 0.25
    ) {
      return {
        expression:
          "😠 Angry",

        confidence:
          Math.min(
            browDown * 0.6 +
              eyeSquint * 0.4,
            1
          ),
      };
    }

    // Strong angry eyebrows
    if (
      browDownLeft > 0.45 &&
      browDownRight > 0.45 &&
      smile < 0.3
    ) {
      return {
        expression:
          "😠 Angry",

        confidence:
          Math.min(
            browDown,
            1
          ),
      };
    }

    // ========================================
    // 😊 HAPPY
    // ========================================

    if (smile > 0.35) {
      return {
        expression:
          "😊 Happy",

        confidence:
          Math.min(
            smile,
            1
          ),
      };
    }

    // ========================================
    // 😞 SAD
    // SLIGHTLY DOWNWARD LIPS
    // ========================================

    const frownLeft =
      getScore(
        blendshapes,
        "mouthFrownLeft"
      );

    const frownRight =
      getScore(
        blendshapes,
        "mouthFrownRight"
      );

    const sadScore =
      (frownLeft +
        frownRight) /
      2;

    /*
      VERY SENSITIVE THRESHOLD

      Even a small downward
      movement of the mouth
      corners should trigger Sad.
    */

    if (
      sadScore > 0.015 &&
      smile < 0.30
    ) {
      return {
        expression:
          "😞 Sad",

        confidence:
          Math.min(
            sadScore * 3,
            1
          ),
      };
    }

    // ========================================
    // 😐 NEUTRAL
    // ========================================

    return {
      expression:
        "😐 Neutral",

      confidence: 0.7,
    };
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #0f0f0f, #1a1a1a)",

        color: "white",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        padding: "30px 20px",

        boxSizing: "border-box",
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          marginBottom: "8px",
        }}
      >
        Face Expression Detector
      </h1>

      <p
        style={{
          color: "#aaa",

          marginTop: 0,

          marginBottom: "25px",
        }}
      >
        Detect your facial expression
      </p>

      {/* ERROR */}

      {error && (
        <div
          style={{
            background: "#351515",

            color: "#ff7070",

            padding:
              "12px 18px",

            borderRadius:
              "10px",

            marginBottom:
              "20px",

            textAlign:
              "center",
          }}
        >
          {error}
        </div>
      )}

      {/* CAMERA */}

      <div
        style={{
          width: "500px",

          maxWidth: "100%",

          height: "400px",

          background: "#111",

          borderRadius: "20px",

          overflow: "hidden",

          border:
            "2px solid #333",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          boxShadow:
            "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {!isStarted && (
          <p
            style={{
              color: "#777",

              fontSize: "18px",
            }}
          >
            Camera is off
          </p>
        )}

        <video
          ref={videoRef}

          autoPlay

          muted

          playsInline

          style={{
            width: "100%",

            height: "100%",

            objectFit: "cover",

            display:
              isStarted
                ? "block"
                : "none",

            transform:
              "scaleX(-1)",
          }}
        />
      </div>

      {/* START BUTTON */}

      {!isStarted && (
        <button
          onClick={
            handleStart
          }

          style={{
            marginTop: "25px",

            padding:
              "14px 32px",

            border: "none",

            borderRadius:
              "10px",

            background:
              "white",

            color: "#111",

            fontSize:
              "17px",

            fontWeight:
              "600",

            cursor:
              "pointer",

            boxShadow:
              "0 8px 25px rgba(0,0,0,0.3)",
          }}
        >
          Start Face Detection
        </button>
      )}

      {/* EXPRESSION */}

      {isStarted && (
        <div
          style={{
            textAlign:
              "center",

            marginTop:
              "25px",
          }}
        >
          <div
            style={{
              fontSize:
                "42px",

              fontWeight:
                "bold",
            }}
          >
            {expression}
          </div>

          <p
            style={{
              color:
                "#aaa",

              fontSize:
                "18px",

              marginTop:
                "10px",
            }}
          >
            Confidence:{" "}
            {confidence}%
          </p>
        </div>
      )}
    </div>
  );
};

export default FaceExpression;