extends Control

@onready var pin_input = $VBoxContainer/PINInput
@onready var name_input = $VBoxContainer/NameInput
@onready var join_button = $VBoxContainer/JoinButton
@onready var error_label = $VBoxContainer/ErrorLabel

func _ready():
	join_button.pressed.connect(_on_join_pressed)

func _on_join_pressed():
	var pin = pin_input.text.strip_edges()
	var player_name = name_input.text.strip_edges()
	
	if pin.length() != 6 or not pin.is_valid_int():
		error_label.text = "❌ PIN must be 6 digits"
		return
	
	if player_name.is_empty():
		error_label.text = "❌ Enter your name"
		return
	
	error_label.text = "🔄 Joining session..."
	
	# Validate PIN exists in RTDB
	var session_data = await Firebase.get_data("sessions/" + pin)
	
	if session_data.is_empty() or session_data.get("status") == null:
		error_label.text = "❌ Session not found"
		return
	
	# Create student entry in session
	var student_id = Firebase.generate_pin()
	var student_data = {
		"name": player_name,
		"score": 0,
		"answer": "",
		"joinedAt": Time.get_ticks_msec()
	}
	
	await Firebase.set_data("sessions/" + pin + "/students/" + student_id, student_data)
	
	# Save to global for access in other scenes
	GlobalGameState.reset()
	GlobalGameState.pin = pin
	GlobalGameState.student_id = student_id
	GlobalGameState.student_name = player_name
	
	# Go to game scene
	get_tree().change_scene_to_file("res://GameScene.tscn")
