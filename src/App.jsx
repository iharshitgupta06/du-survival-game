import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const GAME_WIDTH =
    window.innerWidth < 500
      ? window.innerWidth * 0.95
      : 500;

  const GAME_HEIGHT =
    window.innerWidth < 500
      ? window.innerHeight * 0.9
      : 800;

  const GRAVITY = 0.42;
  const JUMP = -10;
  const PIPE_WIDTH = 65;
  const PIPE_GAP = 230;
  const PIPE_SPEED = 2.2;

  const NORMAL_FACE = "/normal-face.png";
  const GAMEOVER_FACE = "/gameover-face.png";
  const COLLEGE_BG = "/college-bg.jpg";

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const bird = useRef({
    x: 100,
    y: 300,
    velocity: 0,
    size: 28,
  });

  const pipes = useRef([]);

  const resetGame = () => {
    bird.current = {
      x: 100,
      y: 300,
      velocity: 0,
      size: 28,
    };

    pipes.current = [];
    setScore(0);
    setGameOver(false);
    setStarted(false);
  };

  const jump = () => {
    if (gameOver) {
      resetGame();
      return;
    }

    if (!started) setStarted(true);

    bird.current.velocity = JUMP;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [gameOver, started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;

    const bg = new Image();
    bg.src = COLLEGE_BG;

    const normalFace = new Image();
    normalFace.src = NORMAL_FACE;

    const deadFace = new Image();
    deadFace.src = GAMEOVER_FACE;

    const labels = [
      "ASSIGNMENTS",
      "PRACTICALS",
      "MIDSEM",
      "ENDSEM",
    ];

    const createPipe = () => {
      const topHeight =
        Math.random() * 180 + 120;

      pipes.current.push({
        x: GAME_WIDTH,
        topHeight,
        passed: false,
      });
    };

    createPipe();

    let frame = 0;

    const drawBackground = () => {
      ctx.drawImage(
        bg,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
      );

      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    };

    const drawBird = () => {
      const b = bird.current;

      ctx.save();

      ctx.translate(b.x, b.y);

      ctx.rotate(b.velocity * 0.04);

      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        gameOver ? deadFace : normalFace,
        -42,
        -42,
        85,
        85
      );

      ctx.restore();

      ctx.fillStyle = "#ffd54a";

      ctx.beginPath();
      ctx.ellipse(
        b.x - 25,
        b.y + 4,
        12,
        8,
        -0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    const drawPipes = () => {
      pipes.current.forEach((pipe, index) => {
        const label =
          labels[index % labels.length];

        ctx.fillStyle = "#d7b690";

        ctx.fillRect(
          pipe.x,
          0,
          PIPE_WIDTH,
          pipe.topHeight
        );

        ctx.fillRect(
          pipe.x,
          pipe.topHeight + PIPE_GAP,
          PIPE_WIDTH,
          GAME_HEIGHT
        );

        ctx.fillStyle = "#8b5e3c";

        ctx.fillRect(
          pipe.x - 5,
          pipe.topHeight - 18,
          PIPE_WIDTH + 10,
          18
        );

        ctx.fillRect(
          pipe.x - 5,
          pipe.topHeight + PIPE_GAP,
          PIPE_WIDTH + 10,
          18
        );

        ctx.fillStyle = "#3b1d0f";
        ctx.font = "bold 16px Arial";

        const letters = label.split("");

        letters.forEach((letter, i) => {
          ctx.fillText(
            letter,
            pipe.x + 25,
            40 + i * 18
          );
        });
      });
    };

    const checkCollision = () => {
      const b = bird.current;

      if (
        b.y + b.size > GAME_HEIGHT ||
        b.y - b.size < 0
      ) {
        return true;
      }

      for (const pipe of pipes.current) {
        const insidePipeX =
          b.x + b.size > pipe.x &&
          b.x - b.size <
            pipe.x + PIPE_WIDTH;

        const hitsTop =
          b.y - b.size + 8 <
          pipe.topHeight;

        const hitsBottom =
          b.y + b.size - 8 >
          pipe.topHeight + PIPE_GAP;

        if (
          insidePipeX &&
          (hitsTop || hitsBottom)
        ) {
          return true;
        }
      }

      return false;
    };

    const update = () => {
      drawBackground();

      if (started && !gameOver) {
        frame++;

        bird.current.velocity +=
          GRAVITY;

        bird.current.y +=
          bird.current.velocity;

        if (frame % 120 === 0) {
          createPipe();
        }

        pipes.current.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;

          if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH <
              bird.current.x
          ) {
            pipe.passed = true;

            setScore((prev) => {
              const newScore = prev + 1;

              if (
                newScore > highScore
              ) {
                setHighScore(
                  newScore
                );
              }

              return newScore;
            });
          }
        });

        pipes.current =
          pipes.current.filter(
            (pipe) =>
              pipe.x + PIPE_WIDTH >
              -20
          );

        if (checkCollision()) {
          setGameOver(true);
        }
      } else if (!started) {
        frame++;

        bird.current.y +=
          Math.sin(frame * 0.05) *
          0.4;
      }

      drawPipes();

      drawBird();

      ctx.fillStyle = "white";
      ctx.font = "bold 42px Arial";

      ctx.fillText(
        score,
        GAME_WIDTH / 2 - 10,
        70
      );

      ctx.font = "20px Arial";

      ctx.fillText(
        `High Score: ${highScore}`,
        20,
        35
      );

      if (!started) {
        ctx.fillStyle =
          "rgba(0,0,0,0.65)";

        ctx.fillRect(
          40,
          240,
          GAME_WIDTH - 80,
          170
        );

        ctx.fillStyle = "white";

        ctx.font =
          "bold 32px Arial";

        ctx.fillText(
          "DU Survival Game",
          GAME_WIDTH / 2 - 140,
          305
        );

        ctx.font =
          "22px Arial";

        ctx.fillText(
          "Tap or Press SPACE",
          GAME_WIDTH / 2 - 120,
          355
        );
      }

      if (gameOver) {
        ctx.fillStyle =
          "rgba(0,0,0,0.75)";

        ctx.fillRect(
          50,
          240,
          GAME_WIDTH - 100,
          200
        );

        ctx.fillStyle = "white";

        ctx.font =
          "bold 38px Arial";

        ctx.fillText(
          "GAME OVER",
          GAME_WIDTH / 2 - 120,
          315
        );

        ctx.font =
          "26px Arial";

        ctx.fillText(
          `Score: ${score}`,
          GAME_WIDTH / 2 - 60,
          365
        );

        ctx.font =
          "22px Arial";

        ctx.fillText(
          "Tap to Restart",
          GAME_WIDTH / 2 - 80,
          410
        );
      }

      animationRef.current =
        requestAnimationFrame(update);
    };

    update();

    return () =>
      cancelAnimationFrame(
        animationRef.current
      );
  }, [started, gameOver, highScore]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
      }}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={jump}
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "auto",
          borderRadius: "24px",
          cursor: "pointer",
          border: "4px solid #222",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}