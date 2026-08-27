import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../authentication/providers/auth_state_provider.dart';

class UserHeaderWidget extends ConsumerWidget {
  const UserHeaderWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Since user profile is cached locally during auth, we fetch it from the state
    // For simplicity, we can get the current Firebase user
    
    // Instead of directly reading from authControllerProvider which might be just state,
    // we can use Firebase Auth to get the user's name or the authState logic.
    final firebaseUser = ref.watch(firebaseAuthProvider).currentUser;
    final displayName = firebaseUser?.displayName ?? 'Student';
    final photoUrl = firebaseUser?.photoURL;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello,',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ).animate().fade().slideX(begin: -0.1),
                Text(
                  displayName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ).animate().fade().slideX(begin: -0.1, delay: 100.ms),
              ],
            ),
          ),
          const SizedBox(width: 12),
          CircleAvatar(
            radius: 25,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            backgroundImage: photoUrl != null ? NetworkImage(photoUrl) : null,
            child: photoUrl == null
                ? Icon(Icons.person, color: Theme.of(context).colorScheme.primary)
                : null,
          ).animate().scale(delay: 200.ms),
        ],
      ),
    );
  }
}
