import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:markdown/markdown.dart' as md;

class MarkdownMathViewer extends StatelessWidget {
  final String data;
  final ScrollController? scrollController;
  final Color? customTextColor;

  const MarkdownMathViewer({
    super.key,
    required this.data,
    this.scrollController,
    this.customTextColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final textColor = customTextColor ?? (isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A));
    final secondaryTextColor = isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155);

    return MarkdownBody(
      data: data,
      selectable: true,
      // ignore: deprecated_member_use
      imageBuilder: (uri, title, alt) {
        final imageUrl = uri.toString();
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      height: 180,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Center(
                        child: CircularProgressIndicator(color: Color(0xFF4F46E5), strokeWidth: 2),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 140,
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.image_not_supported_rounded, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8), size: 36),
                          const SizedBox(height: 8),
                          Text(
                            alt?.isNotEmpty == true ? 'Image ($alt) could not be loaded' : 'Educational diagram/image could not be loaded',
                            style: TextStyle(color: secondaryTextColor, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              if (alt != null && alt.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  alt,
                  style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: secondaryTextColor),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        );
      },
      builders: {
        'math': MathElementBuilder(textColor: textColor),
        'inline_math': InlineMathElementBuilder(textColor: textColor),
      },
      extensionSet: md.ExtensionSet(
        md.ExtensionSet.gitHubFlavored.blockSyntaxes,
        [
          ...md.ExtensionSet.gitHubFlavored.inlineSyntaxes,
          md.EmojiSyntax(),
          InlineMathSyntax(),
        ],
      ),
      styleSheet: MarkdownStyleSheet.fromTheme(theme).copyWith(
        p: TextStyle(color: textColor, fontSize: 15, height: 1.6, fontWeight: FontWeight.normal),
        h1: TextStyle(color: textColor, fontSize: 22, fontWeight: FontWeight.bold, height: 1.3),
        h2: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold, height: 1.3),
        h3: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold, height: 1.3),
        h4: TextStyle(color: textColor, fontSize: 15, fontWeight: FontWeight.w600, height: 1.3),
        h5: TextStyle(color: textColor, fontSize: 14, fontWeight: FontWeight.w600, height: 1.3),
        h6: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.w600, height: 1.3),
        listBullet: TextStyle(color: textColor, fontSize: 15, fontWeight: FontWeight.bold),
        strong: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        em: TextStyle(color: textColor, fontStyle: FontStyle.italic),
        a: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
        blockquote: TextStyle(color: secondaryTextColor, fontStyle: FontStyle.italic),
        code: TextStyle(
          backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
          color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF0F172A),
          fontFamily: 'monospace',
          fontSize: 13,
        ),
        codeblockDecoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class InlineMathSyntax extends md.InlineSyntax {
  InlineMathSyntax() : super(r'\$\$(.*?)\$\$|\$(.*?)\$');

  @override
  bool onMatch(md.InlineParser parser, Match match) {
    if (match.group(1) != null) {
      // Block math: $$ ... $$
      final element = md.Element.text('math', match.group(1)!);
      parser.addNode(element);
    } else if (match.group(2) != null) {
      // Inline math: $ ... $
      final element = md.Element.text('inline_math', match.group(2)!);
      parser.addNode(element);
    }
    return true;
  }
}

class MathElementBuilder extends MarkdownElementBuilder {
  final Color textColor;

  MathElementBuilder({required this.textColor});

  @override
  Widget visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Math.tex(
            element.textContent,
            textStyle: (preferredStyle ?? const TextStyle()).copyWith(
              fontSize: 18,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }
}

class InlineMathElementBuilder extends MarkdownElementBuilder {
  final Color textColor;

  InlineMathElementBuilder({required this.textColor});

  @override
  Widget visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Math.tex(
        element.textContent,
        textStyle: (preferredStyle ?? const TextStyle()).copyWith(
          color: textColor,
        ),
      ),
    );
  }
}

