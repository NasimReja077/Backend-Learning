import { useCallback } from 'react';
import { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export const useParticles = () => {
  const initParticles = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    
    const container = await engine.load({
      id: "tsparticles",
      options: {
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: "#6366f1"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: {
              enable: false
            }
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false
            }
          },
          links: {
            enable: true,
            distance: 150,
            color: "#6366f1",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "out"
            },
            bounce: false,
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "repulse"
            },
            onClick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            },
            push: {
              quantity: 4
            }
          }
        },
        detectRetina: true
      }
    });

    return container;
  }, []);

  return { initParticles };
};