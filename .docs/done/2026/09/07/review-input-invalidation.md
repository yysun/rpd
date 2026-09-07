# Review Input Invalidation

## Summary

RPD 3.11.0 preserves review conclusions when unrelated repository work proceeds or a commit keeps
reviewed inputs and scope intact. Relevant material changes require affected-conclusion reassessment;
expanded scope, protected-boundary changes, uncertain reach, or a different reviewer require full
review. Reviewers remain read-only. README, changelog, and maintainer scenario definitions agree.

## Verification

Final VR result, verbatim:

VR risk: non-low — 修改对外提供的评审有效性契约。
VR review round: 1; reviewer: reused

1. **完成：无关变动保留有效结论。** SKILL Review Contract 明确允许无关工作并行，排除证据中性的进度更新及保持 reviewed inputs/scope 的提交造成失效，并取消全仓库 snapshot 要求。README、changelog 和新增场景保持一致。

2. **完成：相关变动按影响重评，重大或不确定变化完整复审。** SKILL 将需求、实现、依赖/配置、测试和验证证据纳入 review inputs，要求输入稳定后、通过前重评受影响结论；范围扩大、保护边界变化、影响不明及更换 reviewer 均触发完整复审。所有未解决 finding 与潜在跨领域影响仍须覆盖，reviewer 保持只读。

3. **完成：文档一致，验证范围如实报告。** 独立 CR 已检查 SKILL、README、3.13.0 changelog 和新增场景，未发现实质问题。验证记录列明 Tier 0、skill validation、diff 检查和安装 symlink 检查通过，并逐项记录无关编辑、中性进度、保留输入的提交、受影响修复、依赖配置变化和影响不明的语义推演。

AP 三项任务均已完成。本次 VR 为只读文档政策验收；静态检查结果来自主代理提供的验证记录。新增并发变动行为场景仅已定义，未实际执行，不能据此声称模型行为已实测。REQ checkbox 由主代理更新。

VR passed: all acceptance criteria complete

## Notes

Release numbering was consolidated into 3.11.0 before publication. Version numbers in the verbatim
VR result above refer to intermediate local drafts, not published releases.

No maintainer repository commit or push was performed. Existing uncommitted work is preserved.
Executed checks and semantic coverage are in the story's verification record; new concurrent-mutation
behavioral scenarios remain unexecuted.
