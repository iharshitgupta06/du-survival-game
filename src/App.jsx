import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const GAME_WIDTH = 420;
  const GAME_HEIGHT = 700;
  const GRAVITY = 0.45;
  const JUMP = -8;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 180;
  const PIPE_SPEED = 3;

  const NORMAL_FACE = "/normal-face.png";
  const GAMEOVER_FACE = "/gameover-face.png";
  const COLLEGE_BG = "/college-bg.jpg";

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const bird = useRef({
    x: 90,
    y: 300,
    velocity: 0,
    size: 30,
  });

  const pipes = useRef([]);

  const resetGame = () => {
    bird.current = {
      x: 90,
      y: 300,
      velocity: 0,
      size: 30,
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
      if (e.code === "Space") jump();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bg = new Image();
    bg.src = COLLEGE_BG;

    const normalFace = new Image();
    normalFace.src = NORMAL_FACE;

    const deadFace = new Image();
    deadFace.src = GAMEOVER_FACE;

    const labels = ["ASSIGNMENTS", "PRACTICALS", "MIDSEM", "ENDSEM"];

    const createPipe = () => {
      const topHeight = Math.random() * 220 + 80;

      pipes.current.push({
        x: GAME_WIDTH,
        topHeight,
        passed: false,
      });
    };

    createPipe();

    let frame = 0;

    const drawBird = () => {
      const b = bird.current;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.velocity * 0.04);

      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        gameOver ? deadFace : normalFace,
        -35,
        -35,
        70,
        70
      );

      ctx.restore();
    };

    const drawPipes = () => {
      pipes.current.forEach((pipe, index) => {
        ctx.fillStyle = "#d6b48a";

        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        ctx.fillRect(
          pipe.x,
          pipe.topHeight + PIPE_GAP,
          PIPE_WIDTH,
          GAME_HEIGHT
        );

        ctx.fillStyle = "#8b5e3c";

        ctx.fillRect(pipe.x - 5, pipe.topHeight - 18, PIPE_WIDTH + 10, 18);

        ctx.fillRect(
          pipe.x - 5,
          pipe.topHeight + PIPE_GAP,
          PIPE_WIDTH + 10,
          18
        );

        ctx.fillStyle = "#3b1d0f";
        ctx.font = "bold 16px Arial";

        const topWord = labels[index % labels.length].split("");

        topWord.forEach((letter, i) => {
          ctx.fillText(letter, pipe.x + 30, 40 + i * 18);
        });
      });
    };

    const checkCollision = () => {
      const b = bird.current;

      if (b.y + b.size > GAME_HEIGHT || b.y - b.size < 0) {
        return true;
      }

      for (const pipe of pipes.current) {
        const insidePipeX =
          b.x + b.size > pipe.x &&
          b.x - b.size < pipe.x + PIPE_WIDTH;

        const hitsTop = b.y - b.size < pipe.topHeight;

        const hitsBottom =
          b.y + b.size > pipe.topHeight + PIPE_GAP;

        if (insidePipeX && (hitsTop || hitsBottom)) {
          return true;
        }
      }

      return false;
    };

    const update = () => {
      ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (started && !gameOver) {
        frame++;

        bird.current.velocity += GRAVITY;
        bird.current.y += bird.current.velocity;

        if (frame % 110 === 0) {
          createPipe();
        }

        pipes.current.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;

          if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.current.x) {
            pipe.passed = true;
            setScore((prev) => prev + 1);
          }
        });

        pipes.current = pipes.current.filter(
          (pipe) => pipe.x + PIPE_WIDTH > -20
        );

        if (checkCollision()) {
          setGameOver(true);
        }
      }

      drawPipes();
      drawBird();

      ctx.fillStyle = "white";
      ctx.font = "bold 36px Arial";
      ctx.fillText(score, 200, 60);

      if (!started) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(45, 240, 330, 160);

        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.fillText("DU Survival Game", 80, 300);

        ctx.font = "20px Arial";
        ctx.fillText("Tap or Press SPACE", 100, 350);
      }

      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(55, 230, 310, 190);

        ctx.fillStyle = "white";
        ctx.font = "bold 34px Arial";
        ctx.fillText("GAME OVER", 105, 290);

        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${score}`, 145, 340);

        ctx.font = "20px Arial";
        ctx.fillText("Tap to Restart", 125, 385);
      }

      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationRef.current);
  }, [started, gameOver]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={jump}
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
