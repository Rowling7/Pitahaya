document.addEventListener('DOMContentLoaded', function () {
    class ParticleBackground {
        constructor() {
            this.config = {
                baseDensity: 80, // 粒子密度基数
                maxParticles: 900, // 最大粒子数量
                particleSpeed: 0.8, // 粒子运动速度
                lineMaxDistance: 120, // 粒子连线最大距离(px)
                lineOpacity: 1, // 连线透明度
                maxConnections: 4, // 单个粒子最大连接数
                mobileFactor: 1.8, // 移动端粒子数量系数
                mouseRadius: 200, // 鼠标影响半径
                orbitRadius: 80,    // 目标环绕半径
                centripetal: 0.08,  // 向心力系数
                maxSpeed: 1.5,  // 最大运动速度
                repulsion: 0.3, // 排斥力系数
                speedOvershoot: 1.2,   // 建议1.1-1.5之间
                speedDecayRate: 0.9,   // 越小恢复越快（0.85-0.98）
                speedRecoveryTime: [0.5, 3] // 恢复时间随机范围
            };
            this.canvas = document.getElementById("particleCanvas");
            this.ctx = this.canvas.getContext("2d");
            this.particles = [];
            this.mouse = { x: null, y: null };
            this.animationFrame = null;
            this.init();
        }
        init() {
            this.resizeCanvas();
            this.createParticles();
            this.bindEvents();
            this.animate();
        }
        bindEvents() {
            window.addEventListener("resize", () => this.resizeCanvas());
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            window.addEventListener("mouseout", () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.createParticles(true);
        }
        createParticles(reset = false) {
            if (reset) this.particles = [];
            let particleCount = Math.floor(
                window.innerWidth / this.config.baseDensity
            );
            particleCount = Math.min(particleCount, this.config.maxParticles);
            if (window.innerWidth < 768) {
                particleCount = Math.floor(particleCount / this.config.mobileFactor);
            }
            const colors = ["#4CAF50", "#2196F3", "#E91E63", "#FFC107", "#c20ab9", "#6b590a", "#ffffff", "#41f10c", "#df68b1f6"];
            for (let i = 0; i < particleCount; i++) {
                const initSpeed = this.config.particleSpeed * (Math.random() * 0.4 + 0.8); // 初始速度浮动±20%
                const angle = Math.random() * Math.PI * 2;
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * this.config.particleSpeed,
                    vy: (Math.random() - 0.5) * this.config.particleSpeed,
                    radius: Math.random() * 2 + 1,    // 大小控制
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: Math.cos(angle) * initSpeed,
                    vy: Math.sin(angle) * initSpeed,
                    baseSpeed: initSpeed, // 记录个体基准速度
                    speedRecovery: 1,     // 速度恢复系数(0~1)
                    recoveryDuration: 0   // 恢复所需时间(帧数)
                });
            }
        }
        drawParticle(particle) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        }
        updateParticle(particle) {
            // 边界反弹保持不变
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseRadius) {
                    // 计算目标方向向量
                    const angle = Math.atan2(dy, dx);
                    const targetX = this.mouse.x - Math.cos(angle) * this.config.orbitRadius;
                    const targetY = this.mouse.y - Math.sin(angle) * this.config.orbitRadius;
                    // 计算向心加速度（使用矢量运算）
                    const ax = (targetX - particle.x) * this.config.centripetal;
                    const ay = (targetY - particle.y) * this.config.centripetal;
                    // 应用加速度前添加速度阻尼
                    const damping = 0.98;
                    particle.vx = particle.vx * damping + ax;
                    particle.vy = particle.vy * damping + ay;
                    // 速度方向修正（强制切向运动）
                    const currentSpeed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
                    const tangentVx = -dy / distance * currentSpeed;
                    const tangentVy = dx / distance * currentSpeed;
                    // 混合原始速度和切向速度（混合系数0.3）
                    particle.vx = particle.vx * 0.7 + tangentVx * 0.3;
                    particle.vy = particle.vy * 0.7 + tangentVy * 0.3;
                    // 动态速度限制（基于当前轨道半径）
                    const targetSpeed = Math.sqrt(this.config.centripetal * this.config.orbitRadius);
                    const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
                    if (speed > targetSpeed) {
                        particle.vx *= targetSpeed / speed;
                        particle.vy *= targetSpeed / speed;
                    }
                }
                // 新增粒子间排斥力
                this.particles.forEach(other => {
                    if (particle === other) return;
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = 5; // 最小间距阈值

                    if (distance < minDistance) {
                        const force = (minDistance - distance) / minDistance * 0.5; // 排斥力强度系数
                        particle.vx += dx * force * 0.1;
                        particle.vy += dy * force * 0.1;
                    }
                });
            }

            // 添加速度恢复系统
            const currentSpeed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
            const speedRatio = currentSpeed / particle.baseSpeed;
            // 触发速度恢复条件
            if (speedRatio > this.config.speedOvershoot) {
                if (particle.recoveryDuration === 0) {
                    // 随机生成恢复时间（秒转帧数）
                    const randTime = this.config.speedRecoveryTime +
                        Math.random() * (this.config.speedRecoveryTime - this.config.speedRecoveryTime);
                    particle.recoveryDuration = Math.ceil(randTime * 60); // 60fps
                }
                // 指数衰减算法
                const decay = Math.pow(this.config.speedDecayRate, 1 / 60);
                particle.vx *= decay;
                particle.vy *= decay;
                // 更新恢复进度
                particle.recoveryDuration = Math.max(0, particle.recoveryDuration - 1);
            }
            // 正常状态重置恢复系统
            else if (particle.recoveryDuration > 0) {
                particle.recoveryDuration = 0;
            }
            // 保持最小速度
            const minSpeed = particle.baseSpeed * 0.6;
            if (currentSpeed < minSpeed) {
                const scale = minSpeed / currentSpeed;
                particle.vx *= scale;
                particle.vy *= scale;
            }

            particle.x += particle.vx;
            particle.y += particle.vy;
        }

        drawConnection(particleA, particleB, distance) {
            const isDark =
                document.documentElement.getAttribute("data-theme") === "dark";
            const isOrbiting = distance < this.config.orbitRadius * 1.5;
            const baseColor = isOrbiting ? "66,165,245" : "158,158,158";
            // 增强动态透明度
            const opacity = (1 - distance / this.config.lineMaxDistance) * this.config.lineOpacity;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(${baseColor},${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(particleA.x, particleA.y);
            this.ctx.lineTo(particleB.x, particleB.y);
            this.ctx.stroke();
        }
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const connectionCount = new Map();
            this.particles.forEach((p) => connectionCount.set(p, 0));
            this.particles.forEach((particle, index) => {
                const neighbors = [];
                for (let i = index + 1; i < this.particles.length; i++) {
                    const other = this.particles[i];
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.config.lineMaxDistance) {
                        neighbors.push({ other, distance });
                    }
                }
                neighbors
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, this.config.maxConnections)
                    .forEach(({ other, distance }) => {
                        if (
                            connectionCount.get(particle) < this.config.maxConnections &&
                            connectionCount.get(other) < this.config.maxConnections
                        ) {
                            this.drawConnection(particle, other, distance);
                            connectionCount.set(
                                particle,
                                connectionCount.get(particle) + 1
                            );
                            connectionCount.set(other, connectionCount.get(other) + 1);
                        }
                    });
            });
            this.particles.forEach((particle) => {
                this.updateParticle(particle);
                this.drawParticle(particle);
            });
            if (this.mouse.x && this.mouse.y) {
                this.particles.forEach((particle) => {
                    const dx = particle.x - this.mouse.x;
                    const dy = particle.y - this.mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (
                        distance < 150 &&
                        connectionCount.get(particle) < this.config.maxConnections
                    ) {
                        this.drawConnection(
                            particle,
                            { x: this.mouse.x, y: this.mouse.y },
                            distance
                        );
                    }
                });
            }
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }
    const particleSystem = new ParticleBackground(); window.particleBackground = particleSystem;
});
