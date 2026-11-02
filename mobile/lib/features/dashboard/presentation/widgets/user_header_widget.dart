import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../authentication/providers/auth_state_provider.dart';

class UserHeaderWidget extends ConsumerWidget {
  const UserHeaderWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final displayName = user?.displayName ?? 'Student';
    final photoUrl = user?.photoURL;
    final grade = user?.grade ?? '8';
    final isAdmin = user?.isAdmin == true;
    final isSuperAdmin = user?.isSuperAdmin == true;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // User Greeting & Name Section (Expanded to take all remaining space)
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/profile'),
              behavior: HitTestBehavior.opaque,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Greeting & Role Badges Row with Wrap for responsive line wrapping
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      const Text(
                        'Welcome back,',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                          height: 1.2,
                        ),
                      ),
                      // Grade Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFC7D2FE)),
                        ),
                        child: Text(
                          'Grade $grade',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF4F46E5),
                            height: 1.1,
                          ),
                        ),
                      ),
                      // Role Pill for Admin / SuperAdmin
                      if (isAdmin)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF4338CA), Color(0xFF6366F1)],
                            ),
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.shield_rounded,
                                color: Colors.white,
                                size: 11,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                isSuperAdmin ? 'SuperAdmin' : 'Admin',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  height: 1.1,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Display Name with clean typography and proper ellipsis
                  Text(
                    displayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.4,
                      height: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Action Buttons: Admin Shield Shortcut + Profile Avatar
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isAdmin) ...[
                Tooltip(
                  message: isSuperAdmin ? 'SuperAdmin Console' : 'Admin Console',
                  child: InkWell(
                    onTap: () => context.push('/admin'),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFC7D2FE)),
                      ),
                      child: const Icon(
                        Icons.admin_panel_settings_rounded,
                        color: Color(0xFF4F46E5),
                        size: 22,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              // Profile Avatar with clean circular border
              GestureDetector(
                onTap: () => context.push('/profile'),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF4F46E5), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF4F46E5).withValues(alpha: 0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFFEEF2FF),
                    backgroundImage: photoUrl != null && photoUrl.isNotEmpty
                        ? NetworkImage(photoUrl)
                        : null,
                    child: photoUrl == null || photoUrl.isEmpty
                        ? const Icon(
                            Icons.person_rounded,
                            color: Color(0xFF4F46E5),
                            size: 24,
                          )
                        : null,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
