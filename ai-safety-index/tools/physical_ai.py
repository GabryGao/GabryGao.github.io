"""Recognize physical AI topics without treating software-agent metaphors as robots."""
import re

EXPLICIT = re.compile(
    r'robotics|humanoid|quadruped|legged robot|robot[- ]assisted|robotic arm|'
    r'vision[- ]language[- ]action|\bvlas?\b|physical[- ]ai|'
    r'embodied\s+(?:ai|intelligence|agent|robot|navigation|manipulation)|'
    r'autonomous\s+(?:driving|vehicles?|cars?|robots?)|self[- ]driving|'
    r'\bautopilot\b|\bfull self[- ]driving\b|\bdrones?\b|'
    r'具身智能|具身机器人|机器人|机械臂|无人机|无人车|无人驾驶|'
    r'自动驾驶|辅助驾驶|驾驶辅助|智能驾驶|智驾|自动泊车', re.I)
HARDWARE = re.compile(
    r'\b(?:actuators?|motors?|grippers?|locomotion|collisions?|pedestrians?|'
    r'vehicles?|lidar|torque|manipulators?)\b|robot\s+(?:arm|hand|body)|'
    r'physical\s+(?:world|environment|interaction)|机械|碰撞|行人|车辆', re.I)
NETWORK = re.compile(r'browser|surf(?:ed|ing)?\s+the\s+web|link shortener|google docs|api key|email account', re.I)


def is_physical_ai(text):
    text = str(text or '')
    # "Self-driving-style hacking" describes software automation, not autonomous vehicles.
    text = re.sub(r'self[- ]driving[- ]style', '', text, flags=re.I)
    if EXPLICIT.search(text):
        return True
    if re.search(r'\b(?:tesla|waymo)\b', text, re.I) and re.search(
            r'crash|collision|pedestrian|recall|driver assistance|vehicle|\bsafety\b', text, re.I):
        return True
    if re.search(r'\brobots?\b', text, re.I):
        return not NETWORK.search(text) or bool(HARDWARE.search(text))
    if re.search(r'embodied|world[- ]models?|具身|世界模型', text, re.I):
        return bool(HARDWARE.search(text))
    return False
