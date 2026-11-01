
const R = [
{cat:"Movement",title:"Platformer player",node:"CharacterBody2D",
desc:"Run left and right, jump with variable height (release early for a short hop) and fall with gravity.",
cap:"Real physics: gravity 980, your jump_velocity and speed",try:"Click the preview, then ←/→ to run and Space to jump",
ranges:{jump_velocity:[-800,-150,10],speed:[40,500,10]},
code:`extends CharacterBody2D

@export var speed: float = 220.0
@export var jump_velocity: float = -420.0
@export var cut_jump_factor: float = 0.5

var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += gravity * delta

	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = jump_velocity
	# Short hop when the button is released early
	if Input.is_action_just_released("ui_accept") and velocity.y < 0:
		velocity.y *= cut_jump_factor

	var dir := Input.get_axis("ui_left", "ui_right")
	velocity.x = dir * speed if dir != 0 else move_toward(velocity.x, 0, speed)
	move_and_slide()`,
vars:[["speed","Horizontal pixels per second."],["jump_velocity","Upward launch speed. Negative because Y points down in 2D."],["cut_jump_factor","Share of upward speed kept when jump is released early (0–1)."],["gravity","Read from Project Settings so every body falls the same way."]]},

{cat:"Movement",title:"Coyote time and jump buffer",node:"CharacterBody2D",isNew:1,
desc:"Two tricks that make jumping feel fair: you can still jump a moment after running off a ledge, and a jump pressed just before landing still counts.",
cap:"Each run presses jump 0.05 / 0.10 / 0.15 s after leaving the ledge",try:"Drag coyote_time and watch which presses still jump",
ranges:{coyote_time:[0,0.3,0.01],jump_buffer:[0,0.3,0.01]},
code:`extends CharacterBody2D

@export var speed: float = 200.0
@export var jump_velocity: float = -380.0
@export var coyote_time: float = 0.12
@export var jump_buffer: float = 0.1

var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")
var coyote_left := 0.0
var buffer_left := 0.0

func _physics_process(delta: float) -> void:
	if is_on_floor():
		coyote_left = coyote_time
	else:
		coyote_left -= delta
		velocity.y += gravity * delta

	if Input.is_action_just_pressed("ui_accept"):
		buffer_left = jump_buffer
	else:
		buffer_left -= delta

	if buffer_left > 0 and coyote_left > 0:
		velocity.y = jump_velocity
		buffer_left = 0
		coyote_left = 0

	velocity.x = Input.get_axis("ui_left", "ui_right") * speed
	move_and_slide()`,
vars:[["coyote_time","Grace period after leaving a ledge when jumping still works."],["jump_buffer","How long an early jump press is remembered before landing."],["coyote_left / buffer_left","Countdown timers. Both must be above 0 for a jump."]]},

{cat:"Movement",title:"Top-down 8-way movement",node:"CharacterBody2D",
desc:"Smooth acceleration and friction for top-down games, with diagonal speed normalized.",
cap:"input × max_speed, eased by acceleration / friction",try:"Click the preview, then use the arrow keys",
code:`extends CharacterBody2D

@export var max_speed: float = 180.0
@export var acceleration: float = 1200.0
@export var friction: float = 1400.0

func _physics_process(delta: float) -> void:
	var input := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if input != Vector2.ZERO:
		velocity = velocity.move_toward(input * max_speed, acceleration * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, friction * delta)
	move_and_slide()`,
vars:[["max_speed","Top speed in pixels per second."],["acceleration","How fast the player reaches max_speed. Low values feel icy."],["friction","How fast the player stops when no key is held."],["input","Vector2 from get_vector; already length ≤ 1, so diagonals aren't faster."]]},

{cat:"Movement",title:"Dash with cooldown",node:"CharacterBody2D",
desc:"A burst of speed in the movement direction, blocked until the cooldown ends.",
cap:"Fast burst with a trail; can_dash waits for the cooldown",try:"Click the preview, ←/→ to walk, Shift or Space to dash",
code:`extends CharacterBody2D

@export var speed: float = 200.0
@export var dash_speed: float = 600.0
@export var dash_time: float = 0.15
@export var dash_cooldown: float = 0.8

var is_dashing := false
var can_dash := true

func _physics_process(_delta: float) -> void:
	var dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if Input.is_action_just_pressed("dash") and can_dash and dir != Vector2.ZERO:
		_dash(dir)
	if not is_dashing:
		velocity = dir * speed
	move_and_slide()

func _dash(dir: Vector2) -> void:
	is_dashing = true
	can_dash = false
	velocity = dir * dash_speed
	await get_tree().create_timer(dash_time).timeout
	is_dashing = false
	await get_tree().create_timer(dash_cooldown).timeout
	can_dash = true`,
vars:[["dash_speed","Speed during the dash."],["dash_time","Dash length in seconds."],["dash_cooldown","Wait before the next dash is allowed."],["is_dashing / can_dash","State flags that lock normal movement and repeat dashes."]]},

{cat:"AI",title:"State machine",node:"CharacterBody2D",isNew:1,
desc:"An enum-based state machine. Each state has its own code path and clear rules for switching, which keeps player and enemy logic from turning into tangled if-statements.",
cap:"One state is active at a time; transitions follow the rules",try:"Click the preview to trigger ATTACK",
code:`extends CharacterBody2D

enum State { IDLE, RUN, JUMP, ATTACK }

@export var speed: float = 200.0
var state: State = State.IDLE

func _physics_process(delta: float) -> void:
	match state:
		State.IDLE:
			velocity.x = 0
			if Input.get_axis("ui_left", "ui_right") != 0:
				_change(State.RUN)
		State.RUN:
			velocity.x = Input.get_axis("ui_left", "ui_right") * speed
			if velocity.x == 0:
				_change(State.IDLE)
		State.JUMP:
			if is_on_floor():
				_change(State.IDLE)
		State.ATTACK:
			velocity.x = 0
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = -400
		_change(State.JUMP)
	if Input.is_action_just_pressed("attack") and state != State.ATTACK:
		_change(State.ATTACK)
	move_and_slide()

func _change(new_state: State) -> void:
	state = new_state
	if new_state == State.ATTACK:
		await get_tree().create_timer(0.3).timeout
		state = State.IDLE`,
vars:[["enum State","Names every possible state. Add DASH, HURT, DEAD as you need them."],["state","The single active state."],["match state","Runs only the code for the current state."],["_change()","One place to switch states, so enter-effects (sounds, animations) live there."]]},

{cat:"Combat",title:"Health with custom signals",node:"Node (component)",
desc:"A reusable health component. It emits signals so UI, sounds and effects react without being wired together.",
cap:"damage() → health_changed → bar updates; 0 → died",try:"Click the preview to deal 25 damage",
code:`extends Node
class_name Health

signal health_changed(current: int, maximum: int)
signal died

@export var max_health: int = 100

var current: int:
	set(value):
		current = clampi(value, 0, max_health)
		health_changed.emit(current, max_health)
		if current == 0:
			died.emit()

func _ready() -> void:
	current = max_health

func damage(amount: int) -> void:
	current -= amount

func heal(amount: int) -> void:
	current += amount`,
vars:[["signal health_changed","Fires on every change; connect a health bar to it."],["signal died","Fires once health reaches 0."],["max_health","Upper limit, editable in the Inspector."],["current","Uses a setter, so any change clamps and emits automatically."]]},

{cat:"Combat",title:"Hit, knockback and invincibility frames",node:"CharacterBody2D",isNew:1,
desc:"Taking a hit pushes the player away and makes them blink and ignore damage for a moment, so one enemy can't drain all health in a single touch.",
cap:"Hits during the blink are ignored",try:"Click the preview to hit the player",
ranges:{knockback:[0,600,10],invuln_time:[0,2,0.05]},
code:`extends CharacterBody2D

@export var knockback: float = 300.0
@export var invuln_time: float = 0.8

var invulnerable := false
@onready var health: Health = $Health

func take_hit(amount: int, from_position: Vector2) -> void:
	if invulnerable:
		return
	health.damage(amount)
	velocity = (global_position - from_position).normalized() * knockback
	invulnerable = true
	var blink := create_tween().set_loops(int(invuln_time / 0.1))
	blink.tween_property(self, "modulate:a", 0.2, 0.05)
	blink.tween_property(self, "modulate:a", 1.0, 0.05)
	await get_tree().create_timer(invuln_time).timeout
	invulnerable = false`,
vars:[["knockback","Push speed away from whatever hit you."],["invuln_time","Seconds of immunity after a hit."],["from_position","Where the hit came from; sets the push direction."],["set_loops(n)","Repeats the blink n times to cover the whole immunity window."]]},

{cat:"Combat",title:"Bullet with lifetime",node:"Area2D",isNew:1,
desc:"A projectile that flies straight, damages what it touches and deletes itself after a set time so missed shots don't pile up.",
cap:"Bullets fade and free themselves when lifetime runs out",try:"Drag speed and lifetime to change the range",
ranges:{speed:[100,1200,10],lifetime:[0.1,3,0.05]},
code:`extends Area2D

@export var speed: float = 600.0
@export var damage: int = 10
@export var lifetime: float = 1.2

var direction := Vector2.RIGHT

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	get_tree().create_timer(lifetime).timeout.connect(queue_free)

func _physics_process(delta: float) -> void:
	position += direction * speed * delta

func _on_body_entered(body: Node2D) -> void:
	if body.has_method("take_hit"):
		body.take_hit(damage, global_position)
	queue_free()`,
vars:[["speed","Pixels per second. Range = speed × lifetime."],["lifetime","Seconds before the bullet removes itself."],["direction","Set by the gun when spawning."],["has_method()","Lets the bullet hit anything with take_hit, with no hard-coded types."]]},

{cat:"Signals",title:"Connect signals in code",node:"Any",
desc:"Hook up a button press, a child's custom signal and a one-shot connection.",
cap:"The emitter sends a signal → every connected function runs",try:"Click the preview to emit",
code:`extends Control

@onready var start_button: Button = $StartButton
@onready var health: Health = $"../Player/Health"
@onready var bar: ProgressBar = $HealthBar

func _ready() -> void:
	start_button.pressed.connect(_on_start_pressed)
	health.health_changed.connect(_on_health_changed)
	health.died.connect(_on_player_died, CONNECT_ONE_SHOT)

func _on_start_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/level_1.tscn")

func _on_health_changed(current: int, maximum: int) -> void:
	bar.max_value = maximum
	bar.value = current

func _on_player_died() -> void:
	print("Game over")`,
vars:[["@onready","Fetches the node once the scene tree is ready."],["$Path","Shorthand for get_node(); the path is relative to this node."],["CONNECT_ONE_SHOT","Disconnects automatically after the first call."]]},

{cat:"Physics",title:"Pickup / trigger zone",node:"Area2D",
desc:"Detects when the player enters, gives a reward and removes itself.",
cap:"body_entered fires → add_coins(value) → queue_free()",
code:`extends Area2D

@export var value: int = 10

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		body.add_coins(value)
		queue_free()`,
vars:[["value","Reward amount given on pickup."],["is_in_group(\"player\")","Add the player to a group named player in the Node tab."],["queue_free()","Deletes the node safely at the end of the frame."]]},

{cat:"Physics",title:"Line-of-sight raycast",node:"Node2D",
desc:"Casts a ray from code to check whether anything blocks the path to a target.",
cap:"The ray turns red when the wall blocks the target",try:"Move your mouse over the preview to move the wall",
code:`extends Node2D

@export var target: Node2D
@export_flags_2d_physics var mask: int = 1

func can_see_target() -> bool:
	var space := get_world_2d().direct_space_state
	var query := PhysicsRayQueryParameters2D.create(
		global_position, target.global_position, mask)
	query.exclude = [self]
	var hit := space.intersect_ray(query)
	return hit.is_empty() or hit.collider == target`,
vars:[["target","Node to look at, assigned in the Inspector."],["mask","Physics layers the ray collides with (walls, the player)."],["hit","Dictionary with collider, position and normal; empty if nothing was hit."]]},

{cat:"AI",title:"Enemy that chases the player",node:"CharacterBody2D",
desc:"Follows the player inside a detection radius and stops when close enough.",
cap:"The enemy moves only while the player is inside detect_radius",try:"Move your mouse over the preview: you are the player",
ranges:{detect_radius:[50,500,10]},
code:`extends CharacterBody2D

@export var speed: float = 120.0
@export var detect_radius: float = 300.0
@export var stop_distance: float = 24.0

var player: Node2D

func _ready() -> void:
	player = get_tree().get_first_node_in_group("player")

func _physics_process(_delta: float) -> void:
	if player == null:
		return
	var to_player := player.global_position - global_position
	var dist := to_player.length()
	if dist < detect_radius and dist > stop_distance:
		velocity = to_player.normalized() * speed
	else:
		velocity = Vector2.ZERO
	move_and_slide()`,
vars:[["detect_radius","Distance at which the enemy notices the player."],["stop_distance","Gap kept so the enemy doesn't push into the player."],["get_first_node_in_group","Finds the player anywhere in the scene without a fixed path."]]},

{cat:"AI",title:"Patrol between points",node:"CharacterBody2D",isNew:1,
desc:"Walks a route of points in order, waits at each one, then loops. The standard guard and enemy behaviour before they spot the player.",
cap:"Moves to each point, waits wait_time, then continues",try:"Drag speed and wait_time",
ranges:{speed:[20,300,5],wait_time:[0,2,0.05]},
code:`extends CharacterBody2D

@export var speed: float = 90.0
@export var wait_time: float = 0.6
@export var points: Array[Vector2] = []

var index := 0
var waiting := false

func _physics_process(_delta: float) -> void:
	if points.is_empty() or waiting:
		return
	var target := points[index]
	if global_position.distance_to(target) < 4.0:
		_next_point()
		return
	velocity = global_position.direction_to(target) * speed
	move_and_slide()

func _next_point() -> void:
	waiting = true
	velocity = Vector2.ZERO
	await get_tree().create_timer(wait_time).timeout
	index = (index + 1) % points.size()
	waiting = false`,
vars:[["points","Route positions in world space; fill them in the Inspector."],["wait_time","Pause at each point."],["index","Which point is next. % points.size() loops back to the start."]]},

{cat:"Timers",title:"Wait, repeat and cooldowns",node:"Any",
desc:"Three timer patterns: a one-off delay with await, a repeating Timer node, and a cooldown check with time stamps.",
cap:"1) one-off await  2) repeating Timer  3) shot cooldown",try:"Click the preview fast to test fire_rate",
ranges:{fire_rate:[0.05,1.5,0.05]},
code:`extends Node2D

@export var fire_rate: float = 0.25
var _last_shot_ms: int = 0

func _ready() -> void:
	# 1. One-off delay
	await get_tree().create_timer(2.0).timeout
	print("2 seconds passed")

	# 2. Repeating timer
	var spawn_timer := Timer.new()
	spawn_timer.wait_time = 3.0
	spawn_timer.autostart = true
	spawn_timer.timeout.connect(func(): print("spawn wave"))
	add_child(spawn_timer)

# 3. Cooldown without nodes
func try_shoot() -> bool:
	var now := Time.get_ticks_msec()
	if now - _last_shot_ms < fire_rate * 1000:
		return false
	_last_shot_ms = now
	return true`,
vars:[["create_timer(sec)","Temporary SceneTreeTimer; await its timeout signal."],["wait_time / autostart","Timer node settings for repeating events."],["fire_rate","Minimum seconds between shots."],["Time.get_ticks_msec()","Milliseconds since the game started."]]},

{cat:"Scenes",title:"Spawn a scene (bullets, enemies)",node:"Node2D",
desc:"Loads a scene once and creates copies at runtime.",
cap:"preload once → instantiate() per shot → add_child",try:"Click the preview to fire",
code:`extends Node2D

const BULLET := preload("res://scenes/bullet.tscn")

@export var bullet_speed: float = 700.0

func shoot() -> void:
	var b := BULLET.instantiate()
	b.global_position = $Muzzle.global_position
	b.rotation = global_rotation
	b.direction = Vector2.RIGHT.rotated(global_rotation)
	b.speed = bullet_speed
	get_tree().current_scene.add_child(b)`,
vars:[["preload()","Loads the scene when the script loads, so spawning has no hitch."],["instantiate()","Creates a new copy of the scene's nodes."],["current_scene.add_child","Adds the bullet to the level, so it doesn't move with the gun."]]},

{cat:"Scenes",title:"Change scene with fade",node:"CanvasLayer (autoload)",
desc:"A global scene switcher. Register it under Project Settings → Autoload as SceneManager, then call SceneManager.go(\"res://...\").",
cap:"Fade to black → change_scene_to_file → fade in",try:"Click the preview to switch levels",
ranges:{},
code:`extends CanvasLayer

@onready var fade: ColorRect = $Fade

func go(path: String, duration: float = 0.4) -> void:
	var t := create_tween()
	t.tween_property(fade, "modulate:a", 1.0, duration)
	await t.finished
	get_tree().change_scene_to_file(path)
	t = create_tween()
	t.tween_property(fade, "modulate:a", 0.0, duration)`,
vars:[["fade","Full-screen black ColorRect, starting transparent (modulate alpha 0)."],["duration","Seconds for each half of the fade."],["Autoload","Keeps this node alive across scene changes."]]},

{cat:"Scenes",title:"Checkpoint and respawn",node:"Area2D + autoload",isNew:1,
desc:"Touching a checkpoint saves its position in a global script. When the player dies, they come back at the last checkpoint instead of the level start.",
cap:"Flag turns green when touched; falling sends you back to it",
code:`# game_state.gd (Autoload as GameState)
extends Node
var respawn_point := Vector2.ZERO

# checkpoint.gd
extends Area2D

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		GameState.respawn_point = global_position
		$Sprite2D.modulate = Color.GREEN

# in player.gd
func die() -> void:
	global_position = GameState.respawn_point
	velocity = Vector2.ZERO`,
vars:[["GameState","Autoload singleton; survives scene reloads and is reachable from any script."],["respawn_point","Last checkpoint position."],["die()","Call it from your death zone or when health hits 0."]]},

{cat:"Gameplay",title:"Interact prompt (press E)",node:"Area2D",isNew:1,
desc:"Shows a prompt when the player is close to a door, chest or NPC, and runs an action when they press the interact key.",
cap:"Prompt shows only inside the area; E runs interact()",try:"Click the preview, ←/→ to walk, E to open",
code:`extends Area2D

signal interacted

@export var prompt_text: String = "Open"
@onready var prompt: Label = $Prompt

var player_inside := false

func _ready() -> void:
	prompt.hide()
	body_entered.connect(func(b): if b.is_in_group("player"): _set_inside(true))
	body_exited.connect(func(b): if b.is_in_group("player"): _set_inside(false))

func _set_inside(value: bool) -> void:
	player_inside = value
	prompt.text = "[E] " + prompt_text
	prompt.visible = value

func _unhandled_input(event: InputEvent) -> void:
	if player_inside and event.is_action_pressed("interact"):
		interacted.emit()
		get_viewport().set_input_as_handled()`,
vars:[["prompt_text","Verb shown in the prompt: Open, Talk, Read."],["player_inside","True while the player overlaps the area."],["interacted","Connect a chest, door or dialogue to this signal."],["set_input_as_handled()","Stops the same key press from also triggering other things."]]},

{cat:"Gameplay",title:"Dialogue typewriter",node:"Label",isNew:1,
desc:"Reveals text one letter at a time. Pressing the key once shows the full line; pressing again moves to the next line.",
cap:"visible_ratio tweens from 0 to 1",try:"Click the preview to skip / advance",
ranges:{chars_per_second:[5,120,1]},
code:`extends Label

signal finished

@export var chars_per_second: float = 35.0
var lines: Array[String] = []
var line_index := 0
var tween: Tween

func start(new_lines: Array[String]) -> void:
	lines = new_lines
	line_index = 0
	_show_line()

func _show_line() -> void:
	text = lines[line_index]
	visible_ratio = 0.0
	tween = create_tween()
	tween.tween_property(self, "visible_ratio", 1.0, text.length() / chars_per_second)

func _unhandled_input(event: InputEvent) -> void:
	if not event.is_action_pressed("ui_accept") or lines.is_empty():
		return
	if tween and tween.is_running():
		tween.kill()
		visible_ratio = 1.0
	elif line_index < lines.size() - 1:
		line_index += 1
		_show_line()
	else:
		finished.emit()`,
vars:[["chars_per_second","Typing speed."],["visible_ratio","Built-in Label property: 0 shows nothing, 1 shows all text."],["tween.kill()","Stops the animation so the line appears instantly."],["finished","Emitted after the last line, to close the box or resume play."]]},

{cat:"Gameplay",title:"Inventory with stacks",node:"Node (autoload)",isNew:1,
desc:"A dictionary-based inventory: item id → count, with a stack limit and a signal for the UI.",
cap:"add_item() stacks up to max_stack, then rejects",try:"Click the preview to pick up a random item",
ranges:{max_stack:[1,20,1]},
code:`extends Node

signal inventory_changed(items: Dictionary)

@export var max_stack: int = 5
var items: Dictionary = {}

func add_item(id: String, amount: int = 1) -> int:
	var have: int = items.get(id, 0)
	var added := mini(amount, max_stack - have)
	if added <= 0:
		return 0
	items[id] = have + added
	inventory_changed.emit(items)
	return added

func remove_item(id: String, amount: int = 1) -> bool:
	if items.get(id, 0) < amount:
		return false
	items[id] -= amount
	if items[id] == 0:
		items.erase(id)
	inventory_changed.emit(items)
	return true

func has_item(id: String, amount: int = 1) -> bool:
	return items.get(id, 0) >= amount`,
vars:[["max_stack","Most of one item a slot can hold."],["items","Dictionary of id → count, easy to save as JSON."],["add_item()","Returns how many were actually added, so leftovers can stay on the ground."],["items.get(id, 0)","Returns 0 instead of crashing when the item isn't owned."]]},

{cat:"Gameplay",title:"Weighted random loot drop",node:"Any",isNew:1,
desc:"Picks a drop where some items are rarer than others. Weights don't need to add up to 100.",
cap:"Bars: drops so far vs expected share",try:"Click the preview to roll 50 drops",
code:`extends Node

var loot_table := {
	"coin": 60,
	"potion": 25,
	"sword": 12,
	"legendary": 3,
}

func roll_loot() -> String:
	var total := 0
	for weight in loot_table.values():
		total += weight
	var roll := randi_range(1, total)
	for item in loot_table:
		roll -= loot_table[item]
		if roll <= 0:
			return item
	return ""`,
vars:[["loot_table","Item → weight. Higher weight means more common."],["total","Sum of weights, so the odds always work out."],["randi_range(1, total)","Random whole number; the loop finds which item's slice it lands in."]]},

{cat:"Gameplay",title:"Score manager (autoload)",node:"Node (autoload)",isNew:1,
desc:"A global score with high-score tracking that any script can update and any UI can listen to.",
cap:"add_score() → score_changed → HUD label updates",try:"Click the preview to collect a coin",
ranges:{coin_value:[1,100,1]},
code:`# Autoload as GameManager
extends Node

signal score_changed(score: int, high_score: int)

@export var coin_value: int = 10
var score := 0
var high_score := 0

func add_score(amount: int = coin_value) -> void:
	score += amount
	high_score = maxi(high_score, score)
	score_changed.emit(score, high_score)

func reset() -> void:
	score = 0
	score_changed.emit(score, high_score)

# hud.gd
# func _ready():
#     GameManager.score_changed.connect(func(s, hs): $Score.text = "Score: %d" % s)`,
vars:[["coin_value","Default points per pickup."],["score / high_score","Current run and best run."],["score_changed","HUD connects once and stays in sync."],["\"%d\" % s","String formatting for whole numbers."]]},

{cat:"Animation",title:"Tweens: pop, flash, float",node:"Node2D",
desc:"Code-driven animation without an AnimationPlayer.",
cap:"pop (TRANS_BACK) · hit_flash (modulate) · float_loop",try:"Click the preview to replay pop and flash",
code:`extends Node2D

func pop() -> void:
	var t := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	scale = Vector2.ZERO
	t.tween_property(self, "scale", Vector2.ONE, 0.3)

func hit_flash() -> void:
	var t := create_tween()
	t.tween_property(self, "modulate", Color.RED, 0.05)
	t.tween_property(self, "modulate", Color.WHITE, 0.15)

func float_loop() -> void:
	var t := create_tween().set_loops()
	t.tween_property(self, "position:y", position.y - 8, 0.8)
	t.tween_property(self, "position:y", position.y, 0.8)`,
vars:[["TRANS_BACK + EASE_OUT","Overshoots slightly, then settles. Good for pickups."],["modulate","Tints the node and its children."],["set_loops()","With no argument the tween repeats forever."],["\"position:y\"","Colon syntax animates one component of a vector."]]},

{cat:"Animation",title:"Sprite animation by state",node:"CharacterBody2D",
desc:"Switches AnimatedSprite2D clips based on movement and flips the sprite to face direction.",
cap:"Clip switches idle → run → jump; flip_h faces the direction",try:"Click the preview, ←/→ to run, Space to jump",
code:`extends CharacterBody2D

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

func _update_animation() -> void:
	if not is_on_floor():
		sprite.play("jump")
	elif absf(velocity.x) > 5.0:
		sprite.play("run")
	else:
		sprite.play("idle")
	if velocity.x != 0:
		sprite.flip_h = velocity.x < 0`,
vars:[["sprite","AnimatedSprite2D with clips named idle, run and jump."],["play(name)","Does nothing if that clip is already playing, so it's safe every frame."],["flip_h","Mirrors the sprite horizontally."]]},

{cat:"Camera",title:"Screen shake",node:"Camera2D",
desc:"Trauma-based shake that decays smoothly. Call add_trauma(0.4) on hits and explosions.",
cap:"add_trauma() → offset shakes, power decays to zero",try:"Click the preview to add 0.4 trauma (click fast to stack)",
ranges:{decay:[0.2,5,0.1]},
code:`extends Camera2D

@export var decay: float = 1.5
@export var max_offset: Vector2 = Vector2(16, 12)

var trauma: float = 0.0

func add_trauma(amount: float) -> void:
	trauma = minf(trauma + amount, 1.0)

func _process(delta: float) -> void:
	if trauma > 0:
		trauma = maxf(trauma - decay * delta, 0)
		var power := trauma * trauma
		offset = Vector2(
			max_offset.x * power * randf_range(-1, 1),
			max_offset.y * power * randf_range(-1, 1))
	else:
		offset = Vector2.ZERO`,
vars:[["trauma","Shake intensity from 0 to 1. Stacks with each hit."],["decay","How much trauma drains per second."],["max_offset","Largest pixel offset at full trauma."],["power","Squared trauma, so small hits stay subtle."]]},

{cat:"UI",title:"Pause menu",node:"Control",
desc:"Pauses the game tree while the menu keeps working.",
cap:"get_tree().paused freezes the game; the menu keeps running",try:"Click the preview or press Esc to pause",
code:`extends Control

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	hide()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		toggle()

func toggle() -> void:
	get_tree().paused = not get_tree().paused
	visible = get_tree().paused

func _on_quit_pressed() -> void:
	get_tree().quit()`,
vars:[["PROCESS_MODE_ALWAYS","Lets this node run while everything else is paused."],["get_tree().paused","Stops processing for nodes set to Inherit or Pausable."],["ui_cancel","Built-in action mapped to Escape."]]},

{cat:"Data",title:"Save and load to JSON",node:"Node (autoload)",
desc:"Writes a dictionary to the user folder and reads it back with safe defaults.",
cap:"save: dict → JSON → user://save.json · load: back",
code:`extends Node

const SAVE_PATH := "user://save.json"

var data := {"coins": 0, "level": 1, "volume": 0.8}

func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	file.store_string(JSON.stringify(data))

func load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		data.merge(parsed, true)`,
vars:[["user://","Writable per-user folder; works on every platform."],["data","Default values; loaded keys overwrite them."],["merge(parsed, true)","Keeps defaults for keys missing from older saves."],["JSON numbers","Load back as float; cast with int() when needed."]]},

{cat:"Audio",title:"Sound effects with pitch variation",node:"Node (autoload)",
desc:"Plays one-shot sounds without cutting each other off, with a slight random pitch so repeats don't sound robotic.",
cap:"Each play gets a random pitch_scale around 1.0",try:"Click the preview to hear it (sound on)",
ranges:{pitch_range:[0,0.5,0.01],volume_db:[-30,0,1]},
code:`extends Node

@export var volume_db: float = -6.0
@export var pitch_range: float = 0.1

func play_sfx(stream: AudioStream) -> void:
	var p := AudioStreamPlayer.new()
	p.stream = stream
	p.volume_db = volume_db
	p.pitch_scale = 1.0 + randf_range(-pitch_range, pitch_range)
	p.bus = "SFX"
	add_child(p)
	p.play()
	p.finished.connect(p.queue_free)`,
vars:[["stream","An imported .wav or .ogg, e.g. preload(\"res://sfx/jump.wav\")."],["volume_db","Loudness in decibels; −6 is about half as loud."],["pitch_range","Random pitch spread around 1.0."],["bus","Audio bus name; create an SFX bus in the Audio tab."]]},

{cat:"Input",title:"Mouse aim and click",node:"Node2D",
desc:"Rotates toward the mouse and reacts to clicks.",
cap:"look_at(mouse) every frame; click emits fired",try:"Move your mouse over the preview and click to shoot",
code:`extends Node2D

signal fired(direction: Vector2)

func _process(_delta: float) -> void:
	look_at(get_global_mouse_position())

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			fired.emit(Vector2.RIGHT.rotated(global_rotation))`,
vars:[["look_at()","Points the node's +X axis at a position."],["_unhandled_input","Only receives clicks the UI didn't consume."],["fired","Custom signal carrying the aim direction."]]},
{cat:"Systems",title:"Settings menu: volume and fullscreen",node:"Control",isNew:1,
desc:"An options screen with a volume slider wired to an audio bus and a fullscreen toggle. Every released game needs one.",
cap:"Slider sets bus volume in dB; toggle switches window mode",try:"Move your mouse across the slider; click to toggle fullscreen",
code:`extends Control

@export var bus_name: String = "Master"

@onready var volume_slider: HSlider = $VBox/Volume
@onready var fullscreen_check: CheckButton = $VBox/Fullscreen

func _ready() -> void:
	var bus := AudioServer.get_bus_index(bus_name)
	volume_slider.value = db_to_linear(AudioServer.get_bus_volume_db(bus))
	fullscreen_check.button_pressed = DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN
	volume_slider.value_changed.connect(_on_volume_changed)
	fullscreen_check.toggled.connect(_on_fullscreen_toggled)

func _on_volume_changed(value: float) -> void:
	var bus := AudioServer.get_bus_index(bus_name)
	AudioServer.set_bus_volume_db(bus, linear_to_db(value))
	AudioServer.set_bus_mute(bus, value < 0.01)

func _on_fullscreen_toggled(on: bool) -> void:
	if on:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)`,
vars:[["bus_name","Audio bus the slider controls: Master, Music or SFX."],["linear_to_db()","Sliders feel natural from 0 to 1; buses use decibels, so convert."],["set_bus_mute","At 0 the bus is muted, since linear_to_db(0) is minus infinity."],["DisplayServer.window_set_mode","Switches between fullscreen and windowed."]]},

{cat:"Systems",title:"Key rebinding",node:"Button",isNew:1,
desc:"A button that lets players change which key triggers an action. Click it, press a new key, done.",
cap:"Click → waiting → next key replaces the action's binding",try:"Click the preview, then press any key to rebind jump",
code:`extends Button

@export var action: String = "ui_accept"
var waiting := false

func _ready() -> void:
	_update_text()
	pressed.connect(_on_pressed)

func _on_pressed() -> void:
	waiting = true
	text = "Press a key..."

func _input(event: InputEvent) -> void:
	if not waiting or not (event is InputEventKey) or not event.pressed:
		return
	InputMap.action_erase_events(action)
	InputMap.action_add_event(action, event)
	waiting = false
	_update_text()
	get_viewport().set_input_as_handled()

func _update_text() -> void:
	var events := InputMap.action_get_events(action)
	var key_name := events[0].as_text() if events.size() > 0 else "none"
	text = "%s: %s" % [action, key_name]`,
vars:[["action","Input Map action this button rebinds."],["waiting","True after the click, until a key arrives."],["action_erase_events","Removes the old keys so only the new one works."],["_input","Used instead of _unhandled_input so it catches the key before gameplay does."]]},

{cat:"Systems",title:"Day/night cycle",node:"CanvasModulate",isNew:1,
desc:"Tints the whole 2D world over time using a color gradient: bright at noon, orange at sunset, dark blue at night.",
cap:"color = gradient.sample(time_of_day)",try:"Drag day_length (preview runs 10× faster)",
ranges:{day_length:[5,240,5]},
code:`extends CanvasModulate

@export var day_length: float = 60.0
@export var gradient: Gradient

var time_of_day: float = 0.25  # 0 = midnight, 0.5 = noon

func _process(delta: float) -> void:
	time_of_day = fmod(time_of_day + delta / day_length, 1.0)
	color = gradient.sample(time_of_day)

func get_hour() -> int:
	return int(time_of_day * 24.0)

func is_night() -> bool:
	var h := get_hour()
	return h < 6 or h >= 20`,
vars:[["day_length","Real seconds for one full day."],["gradient","Colors across the day, edited in the Inspector: dark blue → white → orange → dark blue."],["time_of_day","0 to 1; fmod wraps it back to 0 after midnight."],["is_night()","Use it to spawn night enemies or turn on lights."]]},

{cat:"Systems",title:"Minimap",node:"SubViewportContainer",isNew:1,
desc:"A small live map in the corner. A second camera renders the same world, zoomed out and following the player.",
cap:"Second camera, same world, zoomed out by zoom_out",try:"Drag zoom_out; move your mouse over the left view to move the player",
ranges:{zoom_out:[1,10,0.5]},
code:`extends SubViewportContainer

@export var zoom_out: float = 4.0

@onready var mini_cam: Camera2D = $SubViewport/Camera2D
var player: Node2D

func _ready() -> void:
	$SubViewport.world_2d = get_viewport().world_2d
	mini_cam.zoom = Vector2.ONE / zoom_out
	player = get_tree().get_first_node_in_group("player")

func _process(_delta: float) -> void:
	if player:
		mini_cam.global_position = player.global_position`,
vars:[["world_2d","Sharing the main world means the minimap draws the real level, not a copy."],["zoom_out","How much more of the level the minimap shows. 4 = four times wider."],["mini_cam","Separate Camera2D inside the SubViewport that follows the player."]]}

];

/* ---------- Setup guides: scene tree + steps per recipe ---------- */
const PLAYER_TREE = `Player (CharacterBody2D)  ← attach script here
├─ Sprite2D               ← drag your character image into Texture
└─ CollisionShape2D       ← Shape: New RectangleShape2D`;
const FLOOR_STEP = "Make a Level scene: add a StaticBody2D with a CollisionShape2D (wide RectangleShape2D) and a Sprite2D or ColorRect so you can see the floor. Drag player.tscn into the level.";
const SETUP = {
"Platformer player":{tree:PLAYER_TREE,steps:["Scene → New Scene → Other Node → CharacterBody2D. Rename it Player and save as player.tscn.","Add the Sprite2D and CollisionShape2D children shown above. Resize the shape to cover the sprite.","Right-click Player → Attach Script → Language: GDScript → Create, then paste the code.",FLOOR_STEP,"Optional: add a Camera2D as a child of Player so the view follows it."],run:"Open the level and press F6. Arrows move, Space jumps. ui_left, ui_right and ui_accept are built-in, so no Input Map setup is needed."},
"Coyote time and jump buffer":{tree:PLAYER_TREE,steps:["Build the same player as in Platformer player, or reuse it.","Replace the platformer script with this one (it already includes running and gravity).",FLOOR_STEP+" Leave a gap between two floor pieces to test coyote time."],run:"Press F6 and run off a ledge, then press Space a moment later. You still jump."},
"Top-down 8-way movement":{tree:PLAYER_TREE,steps:["Create the player scene shown above and attach the script.","Select Player and set Motion Mode to Floating in the Inspector. Grounded mode is for platformers.","Make a level with a few StaticBody2D walls (each with a CollisionShape2D)."],run:"Press F6 and move with the arrow keys. Diagonals are the same speed as straight lines."},
"Dash with cooldown":{tree:PLAYER_TREE,steps:["Create the player shown above, set Motion Mode to Floating and attach the script.","Project → Project Settings → Input Map: type dash in Add New Action, click Add, then click + and press Shift."],run:"Press F6, hold an arrow key and press Shift to dash."},
"State machine":{tree:PLAYER_TREE,steps:["Use the platformer player scene and attach this script instead.","Project Settings → Input Map: add an action called attack and bind it to J.","Add gravity from the Platformer recipe if you want real jumps; this script focuses on state switching.","Add print(State.keys()[state]) inside _change() to watch transitions in the Output panel."],run:"Press F6. Run, jump and press J; the Output panel shows each state change."},
"Health with custom signals":{tree:`Player (CharacterBody2D)
├─ Sprite2D
├─ CollisionShape2D
└─ Health (Node)          ← attach health.gd here`,steps:["Select Player → Add Child Node → Node. Rename it Health.","Attach a new script health.gd to it and paste the code. class_name Health lets other scripts write var h: Health.","Damage it from any script: $Health.damage(10)","React to it: $Health.died.connect(queue_free)"],run:"Press F6 and call damage() from a key press or enemy hit to test. See Connect signals in code to drive a health bar."},
"Hit, knockback and invincibility frames":{tree:`Player (CharacterBody2D)  ← attach this script
├─ Sprite2D
├─ CollisionShape2D
└─ Health (Node)          ← from the Health recipe`,steps:["Add the Health component from the Health with custom signals recipe first.","Merge this script into the player: keep your movement code and add take_hit().","Your movement code must call move_and_slide() each frame, so the knockback velocity moves the player.","On the enemy, add an Area2D hitbox and connect body_entered: if body.has_method(\"take_hit\"): body.take_hit(10, global_position)"],run:"Press F6 and walk into an enemy. The player blinks and is pushed back; touching again during the blink does nothing."},
"Bullet with lifetime":{tree:`Bullet (Area2D)          ← attach script, save as res://scenes/bullet.tscn
├─ Sprite2D
└─ CollisionShape2D       ← small CircleShape2D`,steps:["Create a new scene with the Area2D root shown above and save it exactly as res://scenes/bullet.tscn (make a scenes folder first).","Attach the script and paste the code.","In the Inspector under Collision, set Mask to the layers of walls and enemies so the bullet detects them.","Spawn it with the Spawn a scene recipe."],run:"Run your level and shoot; bullets disappear on hit or after lifetime seconds."},
"Connect signals in code":{tree:`HUD (Control)             ← attach script
├─ StartButton (Button)
└─ HealthBar (ProgressBar)`,steps:["Create a Control scene with a Button named StartButton and a ProgressBar named HealthBar. Names must match the $ paths.","Fix the Health path ($\"../Player/Health\") to match your scene tree. The easiest way is to drag the node from the Scene panel into the script while holding Ctrl.","Create res://scenes/level_1.tscn, or change the path to a level you already have."],run:"Press F6 and click Start to change scenes. Damaging the player moves the bar."},
"Pickup / trigger zone":{tree:`Coin (Area2D)             ← attach script
├─ Sprite2D
└─ CollisionShape2D       ← CircleShape2D`,steps:["Build the coin scene shown above and attach the script.","Select your Player → Node tab → Groups → type player → Add.","The player needs this function in its script:\nvar coins := 0\nfunc add_coins(amount: int) -> void:\n\tcoins += amount\n\tprint(coins)","Drop several coins into the level."],run:"Press F6 and walk into a coin. It disappears and the Output panel prints your total."},
"Line-of-sight raycast":{tree:`Enemy (Node2D)            ← attach script
└─ Sprite2D`,steps:["Attach the script, then drag the Player node into the Target slot in the Inspector.","Walls need a StaticBody2D with a CollisionShape2D on collision layer 1 (the mask default).","Call it every frame to test: func _process(_d): print(can_see_target())"],run:"Press F6 and move the player behind a wall; the output switches between true and false."},
"Enemy that chases the player":{tree:`Enemy (CharacterBody2D)   ← attach script
├─ Sprite2D
└─ CollisionShape2D`,steps:["Create the enemy scene and attach the script.","For a top-down game, set Motion Mode to Floating. For a platformer, add gravity and only follow on X.","Put the Player in the group player (Node tab → Groups).","Drop the enemy into a level that contains the player."],run:"Press F6 and walk toward the enemy. It follows once you're inside detect_radius."},
"Patrol between points":{tree:`Guard (CharacterBody2D)   ← attach script
├─ Sprite2D
└─ CollisionShape2D`,steps:["Create the guard and attach the script. Set Motion Mode to Floating for top-down.","Place the guard in your level, then in the Inspector open Points → Add Element and enter world positions.","Tip: put Marker2D nodes where you want stops and copy their positions."],run:"Press F6. The guard walks the route, pausing wait_time at each point."},
"Wait, repeat and cooldowns":{tree:`Any node (Node2D)         ← attach script`,steps:["Attach the script to any node in a running scene.","Watch the Output panel for \"2 seconds passed\" and \"spawn wave\".","For the cooldown, call it from input:\nfunc _process(_d):\n\tif Input.is_action_pressed(\"ui_accept\") and try_shoot():\n\t\tprint(\"bang\")"],run:"Press F6 and hold Space. \"bang\" prints at most every fire_rate seconds."},
"Spawn a scene (bullets, enemies)":{tree:`Gun (Node2D)              ← attach script
├─ Sprite2D
└─ Muzzle (Marker2D)      ← place at the barrel tip`,steps:["Build the bullet scene first (Bullet with lifetime recipe) at res://scenes/bullet.tscn.","Add a Marker2D child named Muzzle at the barrel's tip.","Fire on input:\nfunc _process(_d):\n\tif Input.is_action_just_pressed(\"ui_accept\"):\n\t\tshoot()","Combine with Mouse aim and click to aim the gun."],run:"Press F6 and press Space. Bullets spawn at the muzzle and fly forward."},
"Change scene with fade":{tree:`SceneManager (CanvasLayer) ← attach script, save scene_manager.tscn
└─ Fade (ColorRect)        ← black, Full Rect, alpha 0`,steps:["New scene with a CanvasLayer root; set its Layer to 100 so it draws above everything.","Add a ColorRect named Fade. Choose Layout → Full Rect, set Color to black, Modulate alpha to 0 and Mouse → Filter to Ignore.","Attach the script and save as scene_manager.tscn.","Project Settings → Globals (Autoload): pick the .tscn file (not the .gd), name it SceneManager, click Add.","Switch levels from anywhere: SceneManager.go(\"res://scenes/level_2.tscn\")"],run:"Run the game and trigger go(). The screen fades to black, the level changes and it fades back in."},
"Checkpoint and respawn":{tree:`game_state.gd             ← Autoload as GameState

Checkpoint (Area2D)       ← attach checkpoint part
├─ Sprite2D               ← flag image
└─ CollisionShape2D`,steps:["Create game_state.gd with the first part of the code and add it under Project Settings → Globals (Autoload) as GameState.","Build the Checkpoint scene with the middle part of the code.","Add the die() function to the player script and put the player in group player.","Add a death zone below pits: an Area2D whose body_entered calls body.die()","Set GameState.respawn_point = $Player.global_position in the level's _ready() so you respawn at the start."],run:"Press F6, touch a flag, then fall into a pit. You reappear at the flag."},
"Interact prompt (press E)":{tree:`Chest (Area2D)            ← attach script
├─ Sprite2D
├─ CollisionShape2D       ← bigger than the sprite: the reach zone
└─ Prompt (Label)         ← placed above the chest`,steps:["Build the scene above. The CollisionShape2D sets how close the player must be.","Project Settings → Input Map: add an action called interact and bind it to E.","Put the Player in group player.","React to the interaction: interacted.connect(func(): print(\"opened\"))"],run:"Press F6 and walk to the chest. \"[E] Open\" appears; pressing E prints opened."},
"Dialogue typewriter":{tree:`UI (CanvasLayer)
└─ Panel
   └─ Dialogue (Label)    ← attach script`,steps:["Add a CanvasLayer, a Panel at the bottom of the screen and a Label inside it named Dialogue.","On the Label set Autowrap Mode to Word and give it a fixed width.","Attach the script, then start a conversation from anywhere:\n$UI/Panel/Dialogue.start([\"Hello.\", \"Watch out.\"] as Array[String])"],run:"Press F6. Text types out; Space finishes the line, then moves to the next one."},
"Inventory with stacks":{tree:`inventory.gd              ← Autoload as Inventory`,steps:["Create inventory.gd, paste the code and add it under Project Settings → Globals (Autoload) as Inventory.","Add items from any script: Inventory.add_item(\"coin\")","Check before using: if Inventory.has_item(\"key\"): open_door()","Show it in UI by connecting Inventory.inventory_changed to a function that rebuilds your slots."],run:"Call add_item() from a pickup and print(Inventory.items) to see the dictionary."},
"Weighted random loot drop":{tree:`Any node or autoload      ← attach script`,steps:["Attach the script to an enemy or add it as an autoload called Loot.","Edit loot_table: item names and weights. Higher means more common.","Spawn the result when an enemy dies:\nvar item := roll_loot()\nprint(\"dropped \", item)"],run:"Call roll_loot() in a loop of 100 and print results to check the odds."},
"Score manager (autoload)":{tree:`game_manager.gd           ← Autoload as GameManager

HUD (CanvasLayer)
└─ Score (Label)`,steps:["Create game_manager.gd with the code and add it under Globals (Autoload) as GameManager.","Make a HUD scene: CanvasLayer with a Label named Score; attach the hud.gd lines from the bottom of the code (remove the # marks).","Award points from a pickup: GameManager.add_score()"],run:"Collect a coin; the label updates instantly."},
"Tweens: pop, flash, float":{tree:`Item (Node2D)             ← attach script
└─ Sprite2D`,steps:["Attach the script to any Node2D with a visible child.","Call the effects: func _ready(): pop(); float_loop()","Call hit_flash() from your damage code."],run:"Press F6. The item pops in and bobs up and down."},
"Sprite animation by state":{tree:`Player (CharacterBody2D)
├─ AnimatedSprite2D       ← SpriteFrames: idle, run, jump
└─ CollisionShape2D`,steps:["Replace the Sprite2D with an AnimatedSprite2D. In the Inspector set Sprite Frames → New SpriteFrames.","In the SpriteFrames panel at the bottom, create animations named idle, run and jump and add frames to each.","Paste _update_animation() into your platformer script and call it after move_and_slide() at the end of _physics_process."],run:"Press F6. Idle, run and jump clips switch automatically, and the sprite faces where you move."},
"Screen shake":{tree:`Player (CharacterBody2D)
└─ Camera2D               ← attach script`,steps:["Add a Camera2D as a child of the player and attach the script. Make sure Enabled is on.","Trigger shake from anywhere: get_viewport().get_camera_2d().add_trauma(0.4)"],run:"Press F6 and trigger a hit. The view shakes and settles."},
"Pause menu":{tree:`UI (CanvasLayer)
└─ PauseMenu (Control)    ← attach script, Layout: Full Rect
   └─ VBoxContainer
      ├─ ResumeButton (Button)
      └─ QuitButton (Button)`,steps:["Build the menu above inside a CanvasLayer in your level.","Select QuitButton → Node tab → Signals → pressed → Connect to PauseMenu, method _on_quit_pressed.","Connect ResumeButton's pressed signal to toggle.","The script sets Process Mode to Always so the menu works while paused."],run:"Press F6 and press Esc. The game freezes and the menu appears."},
"Save and load to JSON":{tree:`save_manager.gd           ← Autoload as SaveManager`,steps:["Create save_manager.gd and add it under Globals (Autoload) as SaveManager.","Change values: SaveManager.data.coins += 1","Save on checkpoints or quitting: SaveManager.save_game()","Load at startup: call SaveManager.load_game() in your main menu's _ready()."],run:"Save, close the game, run again and load. Find the file via Project → Open User Data Folder."},
"Sound effects with pitch variation":{tree:`sfx.gd                    ← Autoload as Sfx`,steps:["Bottom panel → Audio → Add Bus. Rename it SFX.","Import a sound: drag a .wav or .ogg into the FileSystem panel (e.g. res://sfx/jump.wav).","Create sfx.gd and add it under Globals (Autoload) as Sfx.","Play from anywhere: Sfx.play_sfx(preload(\"res://sfx/jump.wav\"))"],run:"Jump a few times; each sound is slightly different in pitch."},
"Mouse aim and click":{tree:`Turret (Node2D)           ← attach script
└─ Sprite2D               ← art must point to the RIGHT`,steps:["Attach the script. Draw or rotate the sprite so the barrel points right, since look_at aims +X.","Connect the signal to spawn bullets: fired.connect(func(dir): print(dir))","Combine with Spawn a scene to actually shoot."],run:"Press F6. The turret follows the mouse and left-click emits fired."}
};
/* Common mistakes: [symptom, cause and fix] */
const MISTAKES = {
"Platformer player":[["Player falls through the floor","The floor has no CollisionShape2D, or its shape is empty. Add a StaticBody2D + CollisionShape2D with a shape set."],["Jump never works","is_on_floor() only updates inside move_and_slide(). Keep movement in _physics_process, not _process."],["Player floats down slowly","velocity.y is reset to 0 every frame somewhere else. Only change velocity.x for horizontal input."]],
"Coyote time and jump buffer":[["Can jump forever in the air","coyote_left is never reduced. Make sure the else branch subtracts delta every frame."],["Double jumps happen","Both timers must be set to 0 after jumping, or the next frame jumps again."]],
"Top-down 8-way movement":[["Player slides along walls strangely or sticks","Motion Mode is still Grounded. Set it to Floating in the Inspector."],["Moving diagonally is faster","You built the vector from two get_axis calls. Use Input.get_vector, which normalizes for you."]],
"Dash with cooldown":[["Error: The InputMap action \"dash\" doesn't exist","Add the dash action under Project Settings → Input Map and assign a key."],["Dash does nothing when standing still","By design dir must be non-zero. Store the last direction you moved and dash in that direction instead."],["Player passes through thin walls","dash_speed is too high for the collision. Lower it or make walls thicker."]],
"State machine":[["State gets stuck on ATTACK","The await in _change() never finished because the node was freed or paused. Use a Timer node, or reset state when re-entering."],["Animations flicker between states","Two states keep switching each other on the same frame. Give each transition one clear condition."]],
"Health with custom signals":[["Health bar doesn't move","The signal isn't connected, or it's connected after damage happened. Connect in _ready()."],["died fires more than once","Repeated damage at 0 emits again. Check if current == 0 before applying damage, or use CONNECT_ONE_SHOT."],["Error: Could not find type \"Health\"","The script with class_name Health isn't saved yet. Save it (Ctrl+S) so Godot registers the class."]],
"Hit, knockback and invincibility frames":[["Knockback does nothing","Your movement code overwrites velocity right after the hit. Skip input for a short time while knocked back."],["Player becomes invisible forever","The blink tween was killed mid-loop. Set modulate.a = 1.0 when invulnerability ends."],["Error: Invalid get index 'damage' (on base: 'null')","There's no child named Health. Add the Health node from the Health recipe."]],
"Bullet with lifetime":[["Bullets go through enemies","The Area2D Mask doesn't include the enemy's collision Layer. Match them in the Collision section."],["Bullets hit the player who fired them","They share a layer. Put player bullets on a layer the player isn't on, or check the body before damaging."],["Error loading the scene","The path must match exactly, including case: res://scenes/bullet.tscn."]],
"Connect signals in code":[["Error: Node not found: \"StartButton\"","The $ name doesn't match the node name in the Scene panel. Rename the node or fix the path."],["The function is called twice","It's connected in the editor's Node tab AND in code. Pick one."],["Changing scene does nothing","The level_1.tscn path is wrong. Right-click the scene file → Copy Path and paste it."]],
"Pickup / trigger zone":[["Nothing happens on touch","The player isn't in the player group, or the coin's Mask doesn't include the player's Layer."],["Error: Invalid call. Nonexistent function 'add_coins'","Add the add_coins(amount) function to the player script."],["Coin is collected twice","Two collision shapes overlap the same frame. Set monitoring = false before queue_free()."]],
"Line-of-sight raycast":[["Always returns true","Walls aren't on the layers in mask. Check the walls' Collision Layer."],["Always returns false","The ray hits the enemy's own body. Keep query.exclude = [self] (use the RID of a CollisionObject2D if needed)."],["Crash: target is null","Assign Target in the Inspector, or check if target == null first."]],
"Enemy that chases the player":[["Enemy doesn't move","get_first_node_in_group returned null because the player isn't in the player group."],["Enemy jitters when it reaches you","stop_distance is smaller than the two collision shapes combined. Increase it."],["Enemy flies in a platformer","No gravity in this script. Add gravity and only follow the player on the X axis."]],
"Patrol between points":[["Guard walks to the wrong spot","Points are world coordinates. Copy a Marker2D's global_position, not its local position."],["Guard spins in place at a point","The 4-pixel arrival check is smaller than one frame of movement. Raise it to speed * delta or more."]],
"Wait, repeat and cooldowns":[["Code after await never runs","The node was removed or the tree is paused. Timers stop while paused unless process_always is set."],["Timer node never fires","It wasn't added with add_child(), or autostart/start() wasn't called."]],
"Spawn a scene (bullets, enemies)":[["Bullets move with the gun","They were added as children of the gun. Add them to current_scene instead."],["Error: Invalid set index 'direction'","The bullet scene's script lacks a direction variable. Use the Bullet with lifetime script."],["Bullets appear at (0,0)","Set global_position before add_child, and check that the Muzzle node exists."]],
"Change scene with fade":[["Fade never shows","The ColorRect isn't Full Rect, or the CanvasLayer's Layer is lower than your UI."],["Clicks stop working after a fade","The ColorRect blocks the mouse. Set Mouse → Filter to Ignore."],["Error: Identifier \"SceneManager\" not declared","Add the .tscn under Autoload with that exact name."]],
"Checkpoint and respawn":[["Respawn at (0,0)","respawn_point was never set. Set it to the player's start position in the level's _ready()."],["Checkpoint resets after reload","The value lived in the level scene. Store it in the GameState autoload, which survives reloads."]],
"Interact prompt (press E)":[["Prompt shows but E does nothing","The interact action isn't in the Input Map, or another node consumed the key first."],["Prompt never appears","The Area2D's Mask doesn't include the player's Layer."]],
"Dialogue typewriter":[["Text appears all at once","chars_per_second is huge, or visible_ratio is set elsewhere. Check the Label's Visible Ratio is not animated by another node."],["Error: Invalid type in function 'start'","Pass a typed array: [\"Hi\"] as Array[String]."],["Space also makes the player jump","Call get_viewport().set_input_as_handled() after advancing, or pause the player during dialogue."]],
"Inventory with stacks":[["Items vanish after loading a save","JSON returns counts as floats. Convert with int() when loading."],["UI doesn't refresh","Connect inventory_changed to the UI before items are added, usually in the UI's _ready()."]],
"Weighted random loot drop":[["Same item every run","Call randomize() at startup in older 3.x code; in Godot 4 it's automatic unless you set a seed."],["Rare item never drops","The weight is tiny compared to the total. Check the share: weight ÷ total."]],
"Score manager (autoload)":[["Score resets when the level changes","Store score in the GameManager autoload, not in the level or the player."],["Label shows 0 until the first coin","Set the label text once in _ready(), not only in the signal handler."]],
"Tweens: pop, flash, float":[["Animations fight each other","Two tweens animate the same property. Keep a reference and call kill() on the old one first."],["Float loop drifts upward over time","The start position was captured mid-animation. Store the original y in _ready()."]],
"Sprite animation by state":[["Animation stuck on the first frame","Calling play() with a different name every frame restarts it. Make sure only one branch runs per frame."],["Character faces the wrong way","Your sprite art faces left. Invert the check: flip_h = velocity.x > 0."],["Error: Animation 'run' doesn't exist","Names are case-sensitive. Match idle, run and jump in the SpriteFrames panel."]],
"Screen shake":[["Nothing shakes","The Camera2D isn't the current camera. Turn on Enabled and remove other cameras."],["Shake moves the HUD too","The HUD isn't on a CanvasLayer. UI must be inside a CanvasLayer to ignore the camera."]],
"Pause menu":[["Can't unpause","The menu's Process Mode isn't Always, so it froze with everything else."],["Some things keep moving while paused","Those nodes have Process Mode set to Always. Set them to Inherit or Pausable."]],
"Save and load to JSON":[["Error: Invalid call 'store_string' on base 'null'","FileAccess.open failed. Use user:// paths; res:// is read-only in exported games."],["Loaded numbers break integer math","JSON stores numbers as floats. Use int(data.coins) where you need whole numbers."]],
"Sound effects with pitch variation":[["No sound plays","There's no bus named SFX, so it falls silent. Create the bus or remove the p.bus line."],["Sound is cut off","The player was freed too early. Keep the finished.connect(queue_free) line instead of freeing manually."]],
"Mouse aim and click":[["Turret aims 90° off","The sprite art points up. Rotate the art to point right, or add rotation offset."],["Clicks on buttons also fire the gun","Use _unhandled_input (as shown), not _input, so the UI gets clicks first."]]
};
Object.assign(SETUP,{
"Settings menu: volume and fullscreen":{tree:`Settings (Control)        ← attach script, Layout: Full Rect
└─ VBox (VBoxContainer)
   ├─ Volume (HSlider)    ← Min 0, Max 1, Step 0.01
   └─ Fullscreen (CheckButton)`,steps:["Build the tree above. Names must match: VBox, Volume, Fullscreen.","Select Volume and set Min Value 0, Max Value 1, Step 0.01.","Optional: add Music and SFX buses in the Audio panel and make one slider per bus with bus_name set.","Open it from your main menu or pause menu with add_child(preload(\"res://settings.tscn\").instantiate())."],run:"Press F6 and drag the slider while music plays; tick Fullscreen to switch window mode. Fullscreen doesn't apply inside the editor's embedded game window, so test with the game in its own window."},
"Key rebinding":{tree:`Controls (VBoxContainer)
├─ JumpButton (Button)    ← attach script, action = ui_accept
└─ DashButton (Button)    ← same script, action = dash`,steps:["Create a Button, attach the script and set Action in the Inspector to an existing Input Map action.","Duplicate the button (Ctrl+D) for each action and change Action.","To keep bindings after restart, save them: store each action's event as_text() in your save file and rebuild with InputEventKey on load."],run:"Press F6, click a button, press a new key. The label updates and the action uses the new key immediately."},
"Day/night cycle":{tree:`Level (Node2D)
├─ DayNight (CanvasModulate) ← attach script
├─ TileMap / world
└─ UI (CanvasLayer)          ← not affected by the tint`,steps:["Add a CanvasModulate to the level and attach the script.","In the Inspector click Gradient → New Gradient. Add points: 0 dark blue, 0.3 white, 0.7 orange, 1 dark blue.","Add PointLight2D nodes to torches or lamps; they glow through the dark tint at night.","Read the hour from anywhere: $DayNight.get_hour()"],run:"Set day_length to 10, press F6 and watch the world cycle through a full day."},
"Minimap":{tree:`UI (CanvasLayer)
└─ Minimap (SubViewportContainer) ← attach script, Stretch on
   └─ SubViewport              ← size e.g. 200×150
      └─ Camera2D              ← Enabled`,steps:["Inside a CanvasLayer add a SubViewportContainer, anchor it to a corner and turn Stretch on.","Add a SubViewport child, then a Camera2D inside it.","Put the player in group player.","For a cleaner map, show only some layers: set the SubViewport camera's Visibility Layer, or give map-only icons their own layer."],run:"Press F6. The corner shows the level zoomed out, centred on the player."}
});
Object.assign(MISTAKES,{
"Settings menu: volume and fullscreen":[["Volume jumps from silent to loud","Setting dB directly from a 0–100 slider. Use a 0–1 slider with linear_to_db()."],["Fullscreen does nothing","You're testing in the editor's embedded game view. Run the game in a separate window or export it."],["Settings reset every launch","Save the slider value and fullscreen state with the Save and load recipe, and apply them at startup."]],
"Key rebinding":[["New key works but the old one still does too","action_erase_events wasn't called before adding the new event."],["Pressing the key also triggers the action instantly","Call get_viewport().set_input_as_handled() after rebinding."],["Bindings reset on restart","InputMap changes aren't saved. Store them in your save file and re-add them on load."]],
"Day/night cycle":[["The UI goes dark too","The HUD isn't inside a CanvasLayer. CanvasModulate tints everything on the main canvas."],["Error: Invalid call 'sample' on base 'null'","No Gradient assigned. Create one in the Inspector."],["Lights don't glow at night","Use PointLight2D; plain bright sprites are tinted like everything else."]],
"Minimap":[["Minimap is grey or empty","world_2d wasn't shared, or the SubViewport's Camera2D isn't Enabled."],["Minimap shows the HUD inside itself","The HUD is in the main world. Put UI in a CanvasLayer."],["The main camera stopped following the player","Only one camera per viewport is current. The minimap camera must live inside the SubViewport."]]
});
const GETTING_STARTED = [
 ["Install Godot","Download Godot 4 (Standard version) from godotengine.org. It's free and needs no installer: unzip and run."],
 ["Create a project","Project Manager → Create → choose an empty folder → Renderer: Compatibility works on any PC."],
 ["Build a scene","Click + Other Node, pick the root type the recipe names (e.g. CharacterBody2D), then add the children from the recipe's scene tree with Ctrl+A."],
 ["Attach the script","Right-click the root node → Attach Script → Language: GDScript → Create. Delete the template and paste the recipe (use Copy)."],
 ["Inputs, groups, autoloads","Input Map: Project → Project Settings → Input Map. Groups: select node → Node tab → Groups. Autoloads: Project Settings → Globals → Autoload."],
 ["Run it","F6 runs the current scene, F5 runs the main scene. Errors show in the Debugger panel at the bottom with the line number."],
 ["Common errors","\"Node not found\": a $Name doesn't match your tree. \"Invalid call\": a function the recipe expects (like add_coins) is missing. Indentation must use tabs."]
];

