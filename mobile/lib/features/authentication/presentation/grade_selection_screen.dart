import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../providers/auth_controller.dart';

class GradeSelectionScreen extends ConsumerStatefulWidget {
  const GradeSelectionScreen({super.key});

  @override
  ConsumerState<GradeSelectionScreen> createState() => _GradeSelectionScreenState();
}

class _GradeSelectionScreenState extends ConsumerState<GradeSelectionScreen> {
  String? _selectedGrade;
  final List<String> _grades = ['Primary', 'Middle School', 'High School', 'College', 'Other'];

  void _submit() async {
    if (_selectedGrade != null) {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        try {
          await ref.read(authControllerProvider.notifier).updateProfile(
            uid: user.uid,
            grade: _selectedGrade,
          );
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to update grade: $e')),
            );
          }
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState is AsyncLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Select Grade')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'What is your current grade/level?',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: RadioGroup<String>(
                  groupValue: _selectedGrade,
                  onChanged: (value) {
                    setState(() {
                      _selectedGrade = value;
                    });
                  },
                  child: ListView.builder(
                    itemCount: _grades.length,
                    itemBuilder: (context, index) {
                      final grade = _grades[index];
                      return RadioListTile<String>(
                        title: Text(grade),
                        value: grade,
                      );
                    },
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: (isLoading || _selectedGrade == null) ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Finish Setup', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
