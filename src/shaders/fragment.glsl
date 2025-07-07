precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float blend;
uniform float lightIntensity;
uniform float specularStrength;
uniform vec3 lightColor;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float scene(vec3 p) {
  p.x -= 0.05;
  vec3 offset = vec3(sin(iTime), 0.0, 0.0);
  float d1 = sdSphere(p + offset, 0.5);
  float d2 = sdSphere(p, 0.3);
  return smin(d1, d2, blend);
}

vec3 calcNormal(vec3 p) {
  float eps = 0.0001;
  vec2 h = vec2(eps, 0.0);
  return normalize(vec3(
    scene(p + vec3(h.x, h.y, h.y)) - scene(p - vec3(h.x, h.y, h.y)),
    scene(p + vec3(h.y, h.x, h.y)) - scene(p - vec3(h.y, h.x, h.y)),
    scene(p + vec3(h.y, h.y, h.x)) - scene(p - vec3(h.y, h.y, h.x))
  ));
}

vec3 lighting(vec3 ro, vec3 p) {
  vec3 normal = calcNormal(p);
  vec3 viewDir = normalize(ro - p);

  vec3 lightDir = normalize(vec3(-0.5, 1.0, 0.5));
  float diff = max(dot(normal, lightDir), 0.0);

  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), specularStrength);

  vec3 ambient = vec3(0.1);

  return ambient + diff * lightColor * lightIntensity + spec * lightColor;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0, 0.0, -3.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  rd.xy += 0.05 * normalize(uv) * sin(iTime * 1.5) * 0.2;

  float t = 0.0;
  vec3 p;
  bool hit = false;

  for (int i = 0; i < 80; i++) {
    p = ro + rd * t;
    float d = scene(p);
    if (d < 0.005) {
      hit = true;
      break;
    }
    if (t > 50.0) break;
    t += d * 0.8;
  }

  vec3 color = vec3(0.0);
  float alpha = 0.0;

  if (hit) {
    color = lighting(ro, p);
    alpha = 0.4;
  }

  gl_FragColor = vec4(color, alpha);
}